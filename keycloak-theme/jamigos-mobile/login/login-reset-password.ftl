<#import "template.ftl" as layout>
<@layout.registrationLayout displayInfo=true displayMessage=!messagesPerField.existsError('username'); section>
    <#if section = "header">
        <h2 id="kc-page-title">${msg("emailForgotTitle")}</h2>
    <#elseif section = "form">
        <form id="kc-reset-password-form" action="${url.loginAction}" method="post">
            <div class="form-group">
                <label for="username" class="form-label required">
                    <#if !realm.loginWithEmailAllowed>
                        ${msg("username")}
                    <#elseif !realm.registrationEmailAsUsername>
                        ${msg("usernameOrEmail")}
                    <#else>
                        ${msg("email")}
                    </#if>
                </label>
                <input type="text"
                       id="username"
                       name="username"
                       autofocus
                       value="${(auth.attemptedUsername!'')}"
                       <#if !realm.loginWithEmailAllowed>
                           autocomplete="username"
                       <#else>
                           autocomplete="email"
                       </#if>
                       <#if messagesPerField.existsError('username')>aria-invalid="true"</#if>
                />
                <#if messagesPerField.existsError('username')>
                    <span class="input-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('username'))?no_esc}
                    </span>
                </#if>
            </div>

            <div id="kc-form-buttons">
                <input class="btn-primary btn-block"
                       type="submit"
                       value="${msg("doSubmit")}"
                />
            </div>

            <div id="kc-form-options">
                <div class="text-center">
                    <a href="${url.loginUrl}" class="link-secondary">${msg("backToLogin")}</a>
                </div>
            </div>
        </form>
    <#elseif section = "info" >
        <div class="text-center">
            <p class="text-small text-muted">${msg("emailInstruction")}</p>
        </div>
    </#if>
</@layout.registrationLayout>
