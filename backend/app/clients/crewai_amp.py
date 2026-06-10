import json
import time
from typing import Any
from urllib.parse import urljoin

import httpx


class CrewAIAmpError(Exception):
    def __init__(self, message: str, *, status_code: int | None = None) -> None:
        super().__init__(message)
        self.status_code = status_code


def _normalize_state(status_data: dict[str, Any]) -> str:
    raw = status_data.get("state") or status_data.get("status") or ""
    return str(raw).upper()


def _extract_final_output(status_data: dict[str, Any]) -> str:
    result_json = status_data.get("result_json")
    if result_json is not None:
        if isinstance(result_json, dict):
            return json.dumps(result_json)
        if isinstance(result_json, str) and result_json.strip():
            return result_json

    result = status_data.get("result")
    if isinstance(result, dict):
        output = result.get("output")
        if isinstance(output, str) and output.strip():
            return output
    if isinstance(result, str) and result.strip():
        return result

    raise CrewAIAmpError("Crew finished but returned no parseable output.")


class CrewAIAmpClient:
    """Client for a single crew deployed on CrewAI AMP (Enterprise)."""

    def __init__(
        self,
        base_url: str,
        bearer_token: str,
        *,
        timeout_seconds: float = 60.0,
    ) -> None:
        self.base_url = base_url.rstrip("/") + "/"
        self.bearer_token = bearer_token
        self.timeout_seconds = timeout_seconds

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.bearer_token}",
            "Accept": "application/json",
        }

    def _request(
        self,
        method: str,
        path: str,
        *,
        json_body: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        url = urljoin(self.base_url, path.lstrip("/"))
        # Use a generous read timeout but a shorter connect timeout.
        # AMP kickoff and status calls can take 30-90s to respond.
        timeout = httpx.Timeout(
            connect=15.0,
            read=self.timeout_seconds,
            write=15.0,
            pool=5.0,
        )
        try:
            with httpx.Client(timeout=timeout) as client:
                response = client.request(
                    method,
                    url,
                    headers=self._headers(),
                    json=json_body,
                )
        except httpx.RequestError as exc:
            raise CrewAIAmpError(f"Could not reach CrewAI AMP at {url}: {exc}") from exc

        if response.status_code == 401:
            raise CrewAIAmpError(
                "CrewAI bearer token is invalid. Copy it from the crew Status tab.",
                status_code=401,
            )

        if response.status_code >= 400:
            detail = response.text.strip() or response.reason_phrase
            raise CrewAIAmpError(
                f"CrewAI AMP error ({response.status_code}): {detail}",
                status_code=response.status_code,
            )

        data = response.json()
        if not isinstance(data, dict):
            raise CrewAIAmpError("CrewAI AMP returned an unexpected response.")
        return data

    def health(self) -> str:
        """GET /health — AMP deployments expose { \"status\": \"ok\" }."""
        data = self._request("GET", "health")
        status = data.get("status", "ok")
        return str(status)

    def get_inputs(self) -> list[str]:
        data = self._request("GET", "inputs")
        inputs = data.get("inputs", [])
        if not isinstance(inputs, list):
            raise CrewAIAmpError("CrewAI /inputs response is malformed.")
        return [str(item) for item in inputs]

    def kickoff(self, inputs: dict[str, str]) -> str:
        data = self._request("POST", "kickoff", json_body={"inputs": inputs})
        kickoff_id = data.get("kickoff_id")
        if not isinstance(kickoff_id, str) or not kickoff_id:
            raise CrewAIAmpError("CrewAI /kickoff did not return kickoff_id.")
        return kickoff_id

    def get_status(self, kickoff_id: str) -> dict[str, Any]:
        return self._request("GET", f"status/{kickoff_id}")

    def run_and_wait(
        self,
        inputs: dict[str, str],
        *,
        poll_interval_seconds: float = 2.0,
        poll_timeout_seconds: float = 300.0,
    ) -> str:
        kickoff_id = self.kickoff(inputs)
        deadline = time.monotonic() + poll_timeout_seconds
        success_states = {"SUCCESS", "COMPLETED", "COMPLETE"}
        error_states = {"FAILED", "ERROR", "FAILURE"}
        running_states = {"RUNNING", "PENDING", "IN_PROGRESS", "STARTED", ""}

        while time.monotonic() < deadline:
            status_data = self.get_status(kickoff_id)
            state = _normalize_state(status_data)

            if state in success_states or status_data.get("status") == "completed":
                return _extract_final_output(status_data)

            if state in error_states or status_data.get("status") == "error":
                error = (
                    status_data.get("error")
                    or status_data.get("result")
                    or "Unknown crew error"
                )
                raise CrewAIAmpError(f"CrewAI execution failed: {error}")

            if state not in running_states and status_data.get("status") not in (
                "running",
                None,
            ):
                # Unknown terminal state — try to read output before failing
                try:
                    return _extract_final_output(status_data)
                except CrewAIAmpError:
                    raise CrewAIAmpError(f"Unexpected crew state: {state!r}") from None

            time.sleep(poll_interval_seconds)

        raise CrewAIAmpError(
            f"CrewAI execution timed out after {int(poll_timeout_seconds)}s "
            f"(kickoff_id={kickoff_id})."
        )
