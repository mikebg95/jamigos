<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html lang="${(locale.currentLanguageTag)!'en'}">

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <!-- CRITICAL: Set theme IMMEDIATELY before any CSS loads to prevent flash -->
    <script>
        (function() {
            let theme = null;

            // Method 1: Try to read from redirect_uri parameter (highest priority)
            try {
                const urlParams = new URLSearchParams(window.location.search);
                const redirectUri = urlParams.get('redirect_uri');

                if (redirectUri) {
                    // Try to extract theme from redirect_uri (supports both ?theme=X and #theme=X)
                    const themeMatch = redirectUri.match(/[?&]theme=(light|dark)/);
                    if (themeMatch && themeMatch[1]) {
                        theme = themeMatch[1];
                        console.log('[Keycloak Theme] Found theme in redirect_uri:', theme);
                    }
                }
            } catch (e) {
                console.warn('[Keycloak Theme] Failed to parse redirect_uri:', e);
            }

            // Method 2: Check localStorage (might be set from previous session on this domain)
            if (!theme) {
                const stored = localStorage.getItem('app-theme');
                if (stored === 'light' || stored === 'dark') {
                    theme = stored;
                    console.log('[Keycloak Theme] Using localStorage theme:', theme);
                }
            }

            // Method 3: Check system preference as final fallback
            if (!theme) {
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    theme = 'dark';
                    console.log('[Keycloak Theme] Using system preference: dark');
                } else {
                    theme = 'light';
                    console.log('[Keycloak Theme] Using default: light');
                }
            }

            // Set theme immediately
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('app-theme', theme);
            console.log('[Keycloak Theme] Applied theme:', theme);
        })();
    </script>

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>
    <title>${msg("loginTitle",(realm.displayName!''))}</title>
    <link rel="icon" href="${url.resourcesPath}/img/favicon.ico" />

    <!-- Custom theme styles -->
    <link href="${url.resourcesPath}/css/design-system.css" rel="stylesheet" />
    <link href="${url.resourcesPath}/css/auth.css" rel="stylesheet" />

    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet" />
        </#list>
    </#if>
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
    <#if scripts??>
        <#list scripts as script>
            <script src="${script}" type="text/javascript"></script>
        </#list>
    </#if>
</head>

<body class="${bodyClass}">
    <div class="ds-auth-page">
        <div class="ds-auth-bg"></div>

        <div class="ds-auth-card">
            <div class="ds-auth-header">
                <div class="ds-auth-logo">
                    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="24" height="24" rx="6" fill="white" fill-opacity="0.9"/>
                        <path d="M10 16L14 20L22 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>

                <h1 class="ds-auth-title">
                    <#nested "header">
                </h1>

                <#if displayInfo>
                    <p class="ds-auth-subtitle">
                        <#nested "info">
                    </p>
                </#if>
            </div>

            <div class="ds-auth-form">
                <#-- App-initiated actions should not see warning messages about the need to complete the action -->
                <#-- during login.                                                                               -->
                <#if displayMessage && message?has_content && (message.type != 'warning' || !(isAppInitiatedAction!false))>
                    <div class="ds-auth-message ${message.type}" role="alert" aria-live="polite">
                        <#if message.type = 'success'><span class="sr-only">${msg("successMessage")}</span></#if>
                        <#if message.type = 'warning'><span class="sr-only">${msg("warningMessage")}</span></#if>
                        <#if message.type = 'error'><span class="sr-only">${msg("errorMessage")}</span></#if>
                        <#if message.type = 'info'><span class="sr-only">${msg("infoMessage")}</span></#if>
                        <span>${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <#-- Social providers section (if present) -->
                <#nested "socialProviders">

                <#-- Main form section -->
                <#nested "form">
            </div>

            <#if displayInfo>
                <div class="ds-auth-footer">
                    <#nested "info">
                </div>
            </#if>
        </div>
    </div>
</body>
</html>
</#macro>
