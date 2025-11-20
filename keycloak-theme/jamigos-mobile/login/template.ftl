<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}">
<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="robots" content="noindex, nofollow">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <#if properties.meta?has_content>
        <#list properties.meta?split(' ') as meta>
            <meta name="${meta?split('==')[0]}" content="${meta?split('==')[1]}"/>
        </#list>
    </#if>

    <title>${msg("loginTitle",(realm.displayName!''))}</title>

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

    <#-- Load theme script early to prevent flash -->
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

    <link rel="icon" type="image/x-icon" href="${url.resourcesPath}/img/favicon.ico">
</head>

<body class="${properties.kcBodyClass!}">
    <div id="kc-container" class="${properties.kcContainerClass!}">
        <div id="kc-container-wrapper" class="${properties.kcContainerWrapperClass!}">

            <#-- Header with Logo and Page Title -->
            <div id="kc-header" class="${properties.kcHeaderClass!}">
                <div id="kc-header-wrapper" class="${properties.kcHeaderWrapperClass!}">

                    <#-- Logo with Icon and Text (Mobile Theme - matches /mobile-auth) -->
                    <div id="kc-logo">
                        <div id="kc-logo-wrapper">
                            <h1 id="kc-logo-text">Jamigos</h1>
                            <p class="mobile-tagline">Where Musicians Connect & Create</p>
                        </div>
                    </div>

                    <#-- Page Title from specific pages -->
                    <#nested "header">

                    <#-- Required Fields Indicator -->
                    <#if displayRequiredFields>
                        <div class="subtitle">
                            <span class="required">*</span> ${msg("requiredFields")}
                        </div>
                    </#if>

                </div>
            </div>

            <#-- Main Content Card -->
            <div id="kc-content">
                <div id="kc-content-wrapper">

                    <#-- Alert Messages -->
                    <#if displayMessage && message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
                        <div class="alert alert-${message.type}">
                            <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
                        </div>
                    </#if>

                    <#-- Main Form Content -->
                    <#nested "form">

                    <#-- Additional Info Section -->
                    <#if displayInfo>
                        <div id="kc-info">
                            <div id="kc-info-wrapper">
                                <#nested "info">
                            </div>
                        </div>
                    </#if>

                </div>
            </div>

        </div>
    </div>
</body>
</html>
</#macro>
