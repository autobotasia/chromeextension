/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
let url, tabId, hostName;
translateSection(document.body), translateElement("#popup-onboarding-text-1", {
    key: "popupOnboardingStep1",
    isHTML: !0
}), translateElement("#popup-onboarding-text-2", {
    key: "popupOnboardingStep2",
    isHTML: !0,
    interpolations: ['<span class="lt-popup__onboarding__icon1"></span>', '<span class="lt-popup__onboarding__icon2"></span>']
}), translateElement("#popup-onboarding-text-3", {
    key: "popupOnboardingStep3",
    isHTML: !0
}), translateElement("#popup-onboarding-text-4", {
    key: "popupOnboardingStep4",
    isHTML: !0
});
const popupContainer = document.querySelector("#popup-container"),
    validateArea = document.querySelector("#popup-validator"),
    validateButton = document.querySelector("#popup-validator-button"),
    teaserContainer = document.querySelector("#popup-teaser"),
    moreOptionsLink = document.querySelector("#popup-more-options-link"),
    basicLink = document.querySelector("#popup-basic-link"),
    plusLink = document.querySelector("#popup-plus-link");
const onboardingButton = document.querySelector("#onboarding-button");
onboardingButton.addEventListener("click", () => {
    document.querySelector("#popup-onboarding").classList.remove("lt-popup__onboarding-show"), popupContainer.classList.remove("lt-popup--disabled"), Tracker.trackEvent("Action", "popup:onboarding_banner:close"), storageController.updateUIState({
        hasSeenOnboarding: !0
    })
});
let storageController = new StorageController(() => {
    browser.tabs.query({
        currentWindow: !0,
        active: !0
    }).then(e => {
        if (!e || !e.length) return void window.close();
        if (url = e[0].url, tabId = e[0].id, hostName = getHostNameFromUrl(url), !storageController.getPrivacySettings().allowRemoteCheck && !url.startsWith(config.INSTALL_URL)) return window.close(), void browser.runtime.sendMessage({
            command: "OPEN_PRIVACY_CONFIRMATION"
        });
        url && url.match(/docs\.google\.com\/document\/d\//) && browser.runtime.sendMessage({
            command: "GET_GOOGLE_DOCS_PLUGIN_STATE"
        }).then(e => {
            if (e.value) {
                const e = document.querySelector("#popup-hint");
                e.innerHTML = browser.i18n.getMessage("googleDocsPluginInstructions"), e.classList.add("lt-popup__hint--docs"), browser.tabs.sendMessage(tabId, {
                    command: "HIGHLIGHT_GOOGLE_DOCS_PLUGIN"
                })
            }
        }), reloadContentScriptsIfNecessary(tabId);
        const t = TweaksManager.getTweaks(url),
            o = storageController.getValidationSettings(hostName),
            a = {
                enabled: !o.isDisabled,
                supported: t.supported(),
                unsupportedMessage: t.unsupportedMessage(),
                capitalization: o.shouldCapitalizationBeChecked
            },
            n = storageController.getStatistics(),
            i = storageController.getUIState(),
            r = new Date - new Date(1e3 * n.firstVisit);
        if (n.appliedSuggestions < 2 && !i.hasSeenOnboarding) document.querySelector("#popup-onboarding").classList.add("lt-popup__onboarding-show"), popupContainer.classList.add("lt-popup--disabled"), Tracker.trackEvent("Action", "popup:onboarding_banner", hostName);
        else if (a.supported && !storageController.isUsedCustomServer())
            if (i.hasPaidSubscription && popupContainer.classList.add("lt-popup--plus"), !a.supported) {
                const e = document.querySelector("#popup-hint");
                e.classList.add("lt-popup__hint-visible"), e.innerHTML = DOMPurify.sanitize(a.unsupportedMessage, {
                    ALLOWED_TAGS: ["a"],
                    ALLOWED_ATTR: ["target", "href"]
                }), popupContainer.classList.add("lt-popup--disabled"), Tracker.trackEvent("Action", "popup:disabled", getHostNameFromUrl(url))
            }
        a.enabled || (hideCapitalization()), a.capitalization, setTimeout(() => {
            popupContainer.classList.add("lt-popup--animations-enabled")
        }, 500), browser.tabs.sendMessage(tabId, {
            command: "GET_SELECTED_TEXT"
        }).then(e => {
            !e || e.selectedText.trim().length < config.MIN_TEXT_LENGTH || (validateArea.classList.remove("lt-popup__validator--hide"), validateButton.addEventListener("click", t => {
                Tracker.trackEvent("Action", "popup:check_selected_text"), browser.runtime.sendMessage({
                    command: "LAUNCH_VALIDATOR",
                    text: e.selectedText
                }), window.close()
            }))
        }).catch(e => console.log("Failed getting selected text", e)), Tracker.trackPageView()
    })
});
const getDomainTrackingValue = e => "extensions" === e ? url : e,
    enableCapitalization = () => {
        storageController && (storageController.enableCapitalization(hostName), browser.runtime.sendMessage({
            command: "EXTENSION_STATUS_CHANGED",
            tabId: tabId,
            capitalization: !0
        }), Tracker.trackEvent("Action", "enable_capitalization", getDomainTrackingValue(hostName)))
    },
    disableCapitalization = () => {
        storageController && (storageController.disableCapitalization(hostName), browser.runtime.sendMessage({
            command: "EXTENSION_STATUS_CHANGED",
            tabId: tabId,
            capitalization: !1
        }), Tracker.trackEvent("Action", "disable_capitalization", getDomainTrackingValue(hostName)))
    };