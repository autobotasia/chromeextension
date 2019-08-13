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
    optionCapitalization = document.querySelector("#popup-option-capitalization .lt-popup__switch"),
    optionCheck = document.querySelector("#popup-option-check .lt-popup__switch"),
    validateArea = document.querySelector("#popup-validator"),
    validateButton = document.querySelector("#popup-validator-button"),
    teaserContainer = document.querySelector("#popup-teaser"),
    moreOptionsLink = document.querySelector("#popup-more-options-link"),
    basicLink = document.querySelector("#popup-basic-link"),
    plusLink = document.querySelector("#popup-plus-link");
moreOptionsLink.setAttribute("title", browser.i18n.getMessage("popupSettingsHover")), [moreOptionsLink, basicLink, plusLink].forEach(e => {
    e.addEventListener("click", () => {
        browser.runtime.sendMessage({
            command: "OPEN_OPTIONS",
            ref: e === moreOptionsLink ? "popup-icon" : "popup-badge"
        }), window.close()
    })
});
const feedbackLink = document.querySelector("#feedback-link");
feedbackLink.addEventListener("click", () => {
    browser.runtime.sendMessage({
        command: "OPEN_FEEDBACK_FORM",
        url: url
    })
});
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
            if (!i.hasPaidSubscription && ("like" === n.ratingValue || n.appliedSuggestions > 7 || r > 432e5)) {
                let e = 0;
                const t = new Date,
                    o = 300;
                let a;
                for (const i of n.hiddenErrors) {
                    const n = new Date(i.day);
                    if (t - n > 864e6) break;
                    if (a = n, (e += i.count) > o) {
                        e = o;
                        break
                    }
                }
                let i = String(e);
                e >= o && (i = `${o}+`);
                const r = Math.ceil((t - a) / 1e3 / 60 / 60 / 24);
                e > 4 ? new HistoricPremiumErrorsTeaser(teaserContainer, "popup", i, r).render() : new UpgradeTeaser(teaserContainer, "popup").render(), Tracker.trackEvent("Action", "popup:upgrade_teaser", `hidden_errors:${i}`)
            } else i.hasRated || new RatingTeaser(teaserContainer, "popup", url).render();
        if (i.hasPaidSubscription && popupContainer.classList.add("lt-popup--plus"), !a.supported) {
            const e = document.querySelector("#popup-hint");
            e.classList.add("lt-popup__hint-visible"), e.innerHTML = DOMPurify.sanitize(a.unsupportedMessage, {
                ALLOWED_TAGS: ["a"],
                ALLOWED_ATTR: ["target", "href"]
            }), popupContainer.classList.add("lt-popup--disabled"), Tracker.trackEvent("Action", "popup:disabled", getHostNameFromUrl(url))
        }
        a.enabled || (optionCheck.classList.add("lt-popup__switch--off"), hideCapitalization()), a.capitalization || optionCapitalization.classList.add("lt-popup__switch--off"), optionCapitalization.addEventListener("click", e => {
            toggleCapitalization()
        }), optionCheck.addEventListener("click", e => {
            toggleCheck()
        }), setTimeout(() => {
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
    toggleCheck = () => {
        optionCheck.classList.contains("lt-popup__switch--off") ? enableCheck() : disableCheck()
    },
    toggleCapitalization = () => {
        optionCapitalization.classList.contains("lt-popup__switch--off") ? enableCapitalization() : disableCapitalization()
    },
    enableCheck = () => {
        storageController && (optionCheck.classList.remove("lt-popup__switch--off"), storageController.enableDomain(hostName), Tracker.trackEvent("Action", "enable_domain", getDomainTrackingValue(hostName)), browser.runtime.sendMessage({
            command: "EXTENSION_STATUS_CHANGED",
            tabId: tabId,
            enabled: !0
        }), showCapitalization(), Tracker.trackEvent("Action", "enable_domain", getDomainTrackingValue(hostName)))
    },
    disableCheck = () => {
        storageController && (optionCheck.classList.add("lt-popup__switch--off"), storageController.disableDomain(hostName), browser.runtime.sendMessage({
            command: "EXTENSION_STATUS_CHANGED",
            tabId: tabId,
            enabled: !1
        }), hideCapitalization(), Tracker.trackEvent("Action", "disable_domain", getDomainTrackingValue(hostName)))
    },
    showCapitalization = () => {
        optionCapitalization.parentElement.classList.remove("lt-popup__option--hide")
    },
    hideCapitalization = () => {
        optionCapitalization.parentElement.classList.add("lt-popup__option--hide")
    },
    enableCapitalization = () => {
        storageController && (optionCapitalization.classList.remove("lt-popup__switch--off"), storageController.enableCapitalization(hostName), browser.runtime.sendMessage({
            command: "EXTENSION_STATUS_CHANGED",
            tabId: tabId,
            capitalization: !0
        }), Tracker.trackEvent("Action", "enable_capitalization", getDomainTrackingValue(hostName)))
    },
    disableCapitalization = () => {
        storageController && (optionCapitalization.classList.add("lt-popup__switch--off"), storageController.disableCapitalization(hostName), browser.runtime.sendMessage({
            command: "EXTENSION_STATUS_CHANGED",
            tabId: tabId,
            capitalization: !1
        }), Tracker.trackEvent("Action", "disable_capitalization", getDomainTrackingValue(hostName)))
    };