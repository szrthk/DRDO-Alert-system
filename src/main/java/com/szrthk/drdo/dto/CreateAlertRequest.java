package com.szrthk.drdo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CreateAlertRequest {
    @NotBlank
    @Pattern(regexp="LOW|MEDIUM|HIGH|CRITICAL", message="severity must be one of LOW|MEDIUM|HIGH|CRITICAL")
    private String severity;
    @NotBlank @Size(max=255) private String location;
    @NotBlank @Size(max=2000) private String description;

    public String getSeverity() { return severity; } public void setSeverity(String s) { this.severity = s; }
    public String getLocation() { return location; } public void setLocation(String l) { this.location = l; }
    public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
}
