# Spec Delta

## Purpose

Defines how the Amity Dental Solutions site is built and published to Netlify, and how the owner switches the root URL to the maintenance page when needed.

## ADDED Requirements

### Requirement: Static build output
The site SHALL build into a directory of static files (HTML, CSS, images) that can be served by Netlify without a server runtime or serverless functions.

#### Scenario: Production build
- **WHEN** the build command runs on a clean checkout
- **THEN** it exits successfully and produces static HTML for `/` and `/maintenance` in the publish directory

### Requirement: Netlify deployment configuration
The repository SHALL contain Netlify configuration that declares the build command, the publish directory, and the Node.js version, so that connecting the repository to Netlify requires no settings entered in the Netlify UI.

#### Scenario: New Netlify site
- **WHEN** the repository is connected to a new Netlify site with default settings
- **THEN** Netlify builds and publishes the site using the configuration in the repository

### Requirement: Maintenance mode switch
The root path `/` SHALL serve the under-construction page when the `MAINTENANCE_MODE` build environment variable is set to `true`, regardless of whether a landing page exists.

#### Scenario: Maintenance mode enabled
- **WHEN** `MAINTENANCE_MODE=true` is set in the Netlify environment and the site is redeployed
- **THEN** requests to `/` return the under-construction page

#### Scenario: Maintenance mode not set
- **WHEN** `MAINTENANCE_MODE` is unset or any value other than `true`
- **THEN** `/` serves the landing page if one exists, otherwise the under-construction page

### Requirement: Unknown paths
Requests for paths that do not exist SHALL return HTTP 404 with a page that uses the brand styling and links back to `/`.

#### Scenario: Mistyped URL
- **WHEN** a visitor requests `/does-not-exist`
- **THEN** the response status is 404 and the page shows a link to the home page

### Requirement: Custom domain
The site SHALL be served at `https://amitydentalsolutions.com` over HTTPS with a valid certificate. Requests to `www.amitydentalsolutions.com` and to plain `http://` SHALL permanently redirect (301) to `https://amitydentalsolutions.com`, keeping the path.

#### Scenario: Primary address
- **WHEN** a visitor opens `https://amitydentalsolutions.com`
- **THEN** the site loads over HTTPS with a valid certificate and no browser warning

#### Scenario: www address
- **WHEN** a visitor opens `https://www.amitydentalsolutions.com/maintenance`
- **THEN** they are redirected with HTTP 301 to `https://amitydentalsolutions.com/maintenance`

#### Scenario: Plain HTTP
- **WHEN** a visitor opens `http://amitydentalsolutions.com`
- **THEN** they are redirected with HTTP 301 to `https://amitydentalsolutions.com/`

### Requirement: Canonical URL
Every page SHALL declare `https://amitydentalsolutions.com` plus its path as its canonical URL, so search engines index only the primary address.

#### Scenario: Canonical link on the home page
- **WHEN** the HTML for `/` is inspected
- **THEN** it contains `<link rel="canonical" href="https://amitydentalsolutions.com/">`
