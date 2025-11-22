<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        <h2 id="kc-page-title">Register a new account</h2>
    <#elseif section = "form">
        <#-- Quick Login Link (above form) -->
        <div class="text-center" style="margin-bottom: 1.5rem;">
            <span>${msg("alreadyHaveAccount")} <a href="${url.loginUrl}" class="link-primary">${msg("doLogIn")}</a></span>
        </div>

        <form id="kc-register-form" action="${url.registrationAction}" method="post">

            <#-- First Name Field -->
            <div class="form-group">
                <label for="firstName" class="form-label">
                    ${msg("firstName")}
                </label>
                <input type="text"
                       id="firstName"
                       name="firstName"
                       value="${(register.formData.firstName!'')}"
                       autocomplete="given-name"
                       <#if messagesPerField.existsError('firstName')>aria-invalid="true"</#if>
                />
                <#if messagesPerField.existsError('firstName')>
                    <span class="input-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                    </span>
                </#if>
            </div>

            <#-- Last Name Field -->
            <div class="form-group">
                <label for="lastName" class="form-label">
                    ${msg("lastName")}
                </label>
                <input type="text"
                       id="lastName"
                       name="lastName"
                       value="${(register.formData.lastName!'')}"
                       autocomplete="family-name"
                       <#if messagesPerField.existsError('lastName')>aria-invalid="true"</#if>
                />
                <#if messagesPerField.existsError('lastName')>
                    <span class="input-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                    </span>
                </#if>
            </div>

            <#-- Email Field -->
            <div class="form-group">
                <label for="email" class="form-label required">
                    ${msg("email")}
                </label>
                <input type="email"
                       id="email"
                       name="email"
                       value="${(register.formData.email!'')}"
                       autocomplete="email"
                       <#if messagesPerField.existsError('email')>aria-invalid="true"</#if>
                />
                <#if messagesPerField.existsError('email')>
                    <span class="input-error" aria-live="polite">
                        ${kcSanitize(messagesPerField.get('email'))?no_esc}
                    </span>
                </#if>
            </div>

            <#-- Username Field (if not email as username) -->
            <#if !realm.registrationEmailAsUsername>
                <div class="form-group">
                    <label for="username" class="form-label required">
                        ${msg("username")}
                    </label>
                    <input type="text"
                           id="username"
                           name="username"
                           value="${(register.formData.username!'')}"
                           autocomplete="username"
                           <#if messagesPerField.existsError('username')>aria-invalid="true"</#if>
                    />
                    <#if messagesPerField.existsError('username')>
                        <span class="input-error" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('username'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <#-- Password Field -->
            <#if passwordRequired??>
                <div class="form-group">
                    <label for="password" class="form-label required">
                        ${msg("password")}
                    </label>
                    <input type="password"
                           id="password"
                           name="password"
                           autocomplete="new-password"
                           <#if messagesPerField.existsError('password','password-confirm')>aria-invalid="true"</#if>
                    />
                    <#if messagesPerField.existsError('password')>
                        <span class="input-error" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password'))?no_esc}
                        </span>
                    </#if>
                </div>

                <#-- Confirm Password Field -->
                <div class="form-group">
                    <label for="password-confirm" class="form-label required">
                        ${msg("passwordConfirm")}
                    </label>
                    <input type="password"
                           id="password-confirm"
                           name="password-confirm"
                           autocomplete="new-password"
                           <#if messagesPerField.existsError('password-confirm')>aria-invalid="true"</#if>
                    />
                    <#if messagesPerField.existsError('password-confirm')>
                        <span class="input-error" aria-live="polite">
                            ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                        </span>
                    </#if>
                </div>
            </#if>

            <#-- Recaptcha (if configured) -->
            <#if recaptchaRequired??>
                <div class="form-group">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </#if>

            <#-- Form Buttons -->
            <div id="kc-form-buttons">
                <input class="btn-primary btn-block"
                       type="submit"
                       value="${msg("doRegister")}"
                />
            </div>

            <#-- Quick Login Link (below button) -->
            <div class="text-center" style="margin-top: 1rem;">
                <span>${msg("alreadyHaveAccount")} <a href="${url.loginUrl}" class="link-secondary">${msg("doLogIn")}</a></span>
            </div>

        </form>
    <#elseif section = "info" >
        <#-- Back to Login Link -->
        <div id="kc-registration">
            <span>${msg("alreadyHaveAccount")} <a href="${url.loginUrl}">${msg("doLogIn")}</a></span>
        </div>
    </#if>
</@layout.registrationLayout>
