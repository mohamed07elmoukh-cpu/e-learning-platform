param(
    [Parameter(Position = 0)]
    [ValidateSet("build", "tag", "push", "publish")]
    [string]$Action = "build",

    [string]$Namespace = $env:DOCKER_NAMESPACE,
    [string]$Tag = $env:IMAGE_TAG,
    [string]$Registry = $env:DOCKER_REGISTRY
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Namespace) -and -not [string]::IsNullOrWhiteSpace($env:npm_config_namespace)) {
    $Namespace = $env:npm_config_namespace
}

if ([string]::IsNullOrWhiteSpace($Tag)) {
    if (-not [string]::IsNullOrWhiteSpace($env:npm_config_tag)) {
        $Tag = $env:npm_config_tag
    }
    else {
        $Tag = "latest"
    }
}

if ([string]::IsNullOrWhiteSpace($Registry)) {
    if (-not [string]::IsNullOrWhiteSpace($env:npm_config_registry)) {
        $Registry = $env:npm_config_registry
    }
    else {
        $Registry = "docker.io"
    }
}

$root = Split-Path -Parent $PSScriptRoot

$images = @(
    @{ Name = "elearning-frontend"; Context = "frontend" },
    @{ Name = "elearning-gateway"; Context = "gateway" },
    @{ Name = "elearning-auth"; Context = "auth-service" },
    @{ Name = "elearning-catalog"; Context = "services/course-catalog-service" }
)

function Invoke-DockerBuild {
    param([hashtable]$Image)

    $contextPath = Join-Path $root $Image.Context
    Write-Host "Building $($Image.Name):dev from $contextPath"
    docker build -t "$($Image.Name):dev" $contextPath
    if ($LASTEXITCODE -ne 0) {
        throw "Docker build failed for $($Image.Name)"
    }
}

function Get-RemoteImageTag {
    param([hashtable]$Image)

    if ([string]::IsNullOrWhiteSpace($Namespace)) {
        throw "Namespace is required for '$Action'. Use --Namespace <dockerhub_user> or set DOCKER_NAMESPACE."
    }

    if ($Registry -eq "docker.io") {
        return "$Namespace/$($Image.Name):$Tag"
    }

    return "$Registry/$Namespace/$($Image.Name):$Tag"
}

function Invoke-DockerTag {
    param([hashtable]$Image)

    $remoteTag = Get-RemoteImageTag -Image $Image
    Write-Host "Tagging $($Image.Name):dev -> $remoteTag"
    docker tag "$($Image.Name):dev" $remoteTag
    if ($LASTEXITCODE -ne 0) {
        throw "Docker tag failed for $($Image.Name)"
    }
}

function Invoke-DockerPush {
    param([hashtable]$Image)

    $remoteTag = Get-RemoteImageTag -Image $Image
    Write-Host "Pushing $remoteTag"
    docker push $remoteTag
    if ($LASTEXITCODE -ne 0) {
        throw "Docker push failed for $remoteTag"
    }
}

switch ($Action) {
    "build" {
        foreach ($image in $images) {
            Invoke-DockerBuild -Image $image
        }
    }
    "tag" {
        foreach ($image in $images) {
            Invoke-DockerTag -Image $image
        }
    }
    "push" {
        foreach ($image in $images) {
            Invoke-DockerPush -Image $image
        }
    }
    "publish" {
        foreach ($image in $images) {
            Invoke-DockerBuild -Image $image
            Invoke-DockerTag -Image $image
            Invoke-DockerPush -Image $image
        }
    }
}
