$ErrorActionPreference = "Stop"

function Test-Api {
    $baseUrl = "http://localhost:5000/api"
    $random = Get-Random -Minimum 1000 -Maximum 9999
    $email = "testuser$random@example.com"
    
    Write-Host "1. Testing Registration for $email..."
    $regBody = @{
        name = "Test User"
        email = $email
        password = "password123"
        phone = "1234567890"
        age = 30
        gender = "Male"
        department = "IT"
    } | ConvertTo-Json
    
    try {
        $regResponse = Invoke-RestMethod -Uri "$baseUrl/users" -Method Post -Body $regBody -ContentType "application/json"
        Write-Host "Registration Successful. Token received." -ForegroundColor Green
        $token = $regResponse.token
    } catch {
        Write-Error "Registration Failed: $_"
        return
    }

    $headers = @{
        Authorization = "Bearer $token"
    }

    Write-Host "2. Testing Get Profile..."
    try {
        $profile = Invoke-RestMethod -Uri "$baseUrl/users/me" -Method Get -Headers $headers
        Write-Host "Profile Retrieved: $($profile.name) ($($profile.email))" -ForegroundColor Green
    } catch {
        Write-Error "Get Profile Failed: $_"
    }

    Write-Host "3. Testing Add Activity..."
    $activityBody = @{
        exerciseTime = 45
        waterIntake = 3
        sleepHours = 8
        stressLevel = 3
        dietPlan = "Balanced"
    } | ConvertTo-Json

    try {
        $activity = Invoke-RestMethod -Uri "$baseUrl/activities" -Method Post -Body $activityBody -ContentType "application/json" -Headers $headers
        Write-Host "Activity Added. ID: $($activity._id)" -ForegroundColor Green
    } catch {
        Write-Error "Add Activity Failed: $_"
    }

    Write-Host "4. Testing Get Activities..."
    try {
        $activities = Invoke-RestMethod -Uri "$baseUrl/activities" -Method Get -Headers $headers
        if ($activities.Count -gt 0) {
            Write-Host "Activities Retrieved: Start Count $($activities.Count)" -ForegroundColor Green
        } else {
             Write-Host "Activities Retrieved but empty (unexpected)" -ForegroundColor Yellow
        }
    } catch {
        Write-Error "Get Activities Failed: $_"
    }
}

Test-Api
