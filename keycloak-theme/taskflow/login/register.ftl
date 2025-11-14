<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('firstName','lastName','email','username','password','password-confirm'); section>
    <#if section = "header">
        Create your account
    <#elseif section = "form">
        <div id="kc-form">
            <div id="kc-form-wrapper">
                <form id="kc-register-form" class="${properties.kcFormClass!}" action="${url.registrationAction}" method="post">
                    <div class="ds-auth-field">
                        <label for="firstName" class="ds-auth-label <#if !realm.registrationEmailAsUsername>required</#if>">First Name</label>
                        <input type="text" id="firstName" class="ds-auth-input<#if messagesPerField.existsError('firstName')> error</#if>" name="firstName"
                               value="${(register.formData.firstName!'')}"
                               aria-invalid="<#if messagesPerField.existsError('firstName')>true</#if>"
                        />

                        <#if messagesPerField.existsError('firstName')>
                            <span class="ds-field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('firstName'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="ds-auth-field">
                        <label for="lastName" class="ds-auth-label <#if !realm.registrationEmailAsUsername>required</#if>">Last Name</label>
                        <input type="text" id="lastName" class="ds-auth-input<#if messagesPerField.existsError('lastName')> error</#if>" name="lastName"
                               value="${(register.formData.lastName!'')}"
                               aria-invalid="<#if messagesPerField.existsError('lastName')>true</#if>"
                        />

                        <#if messagesPerField.existsError('lastName')>
                            <span class="ds-field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('lastName'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <div class="ds-auth-field">
                        <label for="email" class="ds-auth-label required">Email</label>
                        <input type="text" id="email" class="ds-auth-input<#if messagesPerField.existsError('email')> error</#if>" name="email"
                               value="${(register.formData.email!'')}" autocomplete="email"
                               aria-invalid="<#if messagesPerField.existsError('email')>true</#if>"
                        />

                        <#if messagesPerField.existsError('email')>
                            <span class="ds-field-error" aria-live="polite">
                                ${kcSanitize(messagesPerField.get('email'))?no_esc}
                            </span>
                        </#if>
                    </div>

                    <#if !realm.registrationEmailAsUsername>
                        <div class="ds-auth-field">
                            <label for="username" class="ds-auth-label required">Username</label>
                            <input type="text" id="username" class="ds-auth-input<#if messagesPerField.existsError('username')> error</#if>" name="username"
                                   value="${(register.formData.username!'')}" autocomplete="username"
                                   aria-invalid="<#if messagesPerField.existsError('username')>true</#if>"
                            />

                            <#if messagesPerField.existsError('username')>
                                <span class="ds-field-error" aria-live="polite">
                                    ${kcSanitize(messagesPerField.get('username'))?no_esc}
                                </span>
                            </#if>
                        </div>
                    </#if>

                    <#if passwordRequired??>
                        <div class="ds-auth-field">
                            <label for="password" class="ds-auth-label required">Password</label>
                            <input type="password" id="password" class="ds-auth-input<#if messagesPerField.existsError('password','password-confirm')> error</#if>" name="password"
                                   autocomplete="new-password"
                                   aria-invalid="<#if messagesPerField.existsError('password','password-confirm')>true</#if>"
                            />

                            <#if messagesPerField.existsError('password')>
                                <span class="ds-field-error" aria-live="polite">
                                    ${kcSanitize(messagesPerField.get('password'))?no_esc}
                                </span>
                            </#if>
                        </div>

                        <div class="ds-auth-field">
                            <label for="password-confirm" class="ds-auth-label required">Confirm Password</label>
                            <input type="password" id="password-confirm" class="ds-auth-input<#if messagesPerField.existsError('password-confirm')> error</#if>" name="password-confirm"
                                   aria-invalid="<#if messagesPerField.existsError('password-confirm')>true</#if>"
                            />

                            <#if messagesPerField.existsError('password-confirm')>
                                <span class="ds-field-error" aria-live="polite">
                                    ${kcSanitize(messagesPerField.get('password-confirm'))?no_esc}
                                </span>
                            </#if>
                        </div>
                    </#if>

                    <#if recaptchaRequired??>
                        <div class="ds-auth-field">
                            <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                        </div>
                    </#if>

                    <div class="ds-auth-field" style="margin-top: var(--ds-spacing-xl);">
                        <button type="submit" class="ds-auth-button" value="Register">Register</button>
                    </div>
                </form>
            </div>
        </div>
    <#elseif section = "info">
        <#if realm.password && realm.registrationAllowed && !(registrationDisabled!false)>
            <div id="kc-registration">
                <span>Already have an account? <a href="${url.loginUrl}" class="ds-auth-link">Sign in</a></span>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>
