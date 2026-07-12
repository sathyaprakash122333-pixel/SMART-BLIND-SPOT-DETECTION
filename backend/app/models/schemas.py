from pydantic import BaseModel, ConfigDict, Field


class TelemetryIngestPayload(BaseModel):
    """Validated reading sent from the ESP32 controller."""

    model_config = ConfigDict(extra="ignore")

    leftDistance: float = Field(..., ge=0, le=500, description="Left ultrasonic distance in cm")
    rightDistance: float = Field(..., ge=0, le=500, description="Right ultrasonic distance in cm")
    leftSwitch: bool = Field(..., description="Left indicator switch state")
    rightSwitch: bool = Field(..., description="Right indicator switch state")
    timestamp: str = Field(..., description="ISO-like timestamp from ESP32")
