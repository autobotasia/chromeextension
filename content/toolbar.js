/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class Toolbar {
  constructor( t, e, s = null, o = { requestStatus: REQUEST_STATUS.IN_PROGRESS, errorsCount: 0, hiddenErrorsCount: 0, isIncompleteResult: !1, languageName: "", exceptionMessage: ""}) {
    (this._renderOutsideIframe = !1),
      (this._inputArea = t),
      (this._referenceArea = t),
      (this._document = t.ownerDocument),
      (this._appearance = e),
      (this._mirror = s);
    const r = getFrameElement(window);
    r && this._inputArea === this._inputArea.ownerDocument.body && isLTAvailable(window.parent) && 
      ((this._referenceArea = r),
      (this._document = this._referenceArea.ownerDocument),
      (this._renderOutsideIframe = !0),
      (this._onUnload = bindAndCatch(this._onUnload, this)),
      window.addEventListener("pagehide", this._onUnload, !0)),

      (this._controls = {
        container: null,
        wrapper: null,
        statusIcon: null,
        premiumIcon: null
      }),
      (this._visible = !1),
      (this._sizeDecreased = !1),
      (this._hasNotifiedAboutPremiumIcon = !1),
      (this._domMeasurement = new DomMeasurement(this._document)),
      (this._eventListeners = []),
      this.updateState(o),
      (this._renderInterval = setAnimationFrameInterval(
        bindAndCatch(() => this._updateDisplaying(!0)),
        config.RENDER_INTERVAL
      )),
      (this._decreaseSizeInterval = setAnimationFrameInterval(
        bindAndCatch(() => this._decreaseSizeIfNeeded()),
        config.DECREASE_SIZE_INTERVAL
      )),
      (this._scrollObserver = observeScrollableAncestors(
        this._referenceArea,
        bindAndCatch(() => this._updateDisplaying(!1))
      ));
  }
  _render() {
    const t = ["lt-toolbar__status-icon"],
      e = ["lt-toolbar__premium-icon"];
    let s = Toolbar.MESSAGES.STATUS_ICON_TOOLTIP,
      o = "";
    switch (


      (
        this._controls.container ||
        (
          (this._rootElement = "BODY" === this._referenceArea.tagName ? this._document.documentElement : this._document.body),
          (this._controls.container = this._document.createElement(Toolbar.CONTAINER_ELEMENT_NAME)), 
          this._controls.container.setAttribute("contenteditable", "false"),
          (this._controls.wrapper = this._document.createElement("lt-div")),
          (this._controls.wrapper.className = "lt-toolbar__wrapper"),
          (this._controls.statusIcon = this._document.createElement("lt-div")),
          (this._controls.premiumIcon = this._document.createElement("lt-div")),
          [this._controls.statusIcon, this._controls.premiumIcon].forEach(t => {
            this._eventListeners.push(
              addUseCaptureEvent(t, "mousedown", t => {
                t.stopImmediatePropagation(), t.preventDefault();
              }),
              addUseCaptureEvent(t, "mouseup", t => {
                t.stopImmediatePropagation();
              }),
              addUseCaptureEvent(t, "pointerdown", t => {
                t.stopImmediatePropagation();
              }),
              addUseCaptureEvent(t, "pointerup", t => {
                t.stopImmediatePropagation();
              })
            );
          }),
          this._eventListeners.push(
            addUseCaptureEvent(
              this._controls.statusIcon,
              "click",
              this._onStatusIconClick.bind(this)
            ),
            addUseCaptureEvent(
              this._controls.premiumIcon,
              "click",
              this._onStatusIconClick.bind(this)
            )
          ),
          this._controls.wrapper.appendChild(this._controls.premiumIcon),
          this._controls.wrapper.appendChild(this._controls.statusIcon),
          this._controls.container.appendChild(this._controls.wrapper),
          (this._visible = !0)
        ),

      clearTimeout(this._premiumIconTimeout),
      this._state.requestStatus
      )


    ) {
      case REQUEST_STATUS.IN_PROGRESS:
        t.push("lt-toolbar__status-icon-in-progress");
        break;
      case REQUEST_STATUS.COMPLETED:
      case REQUEST_STATUS.TEXT_TOO_SHORT:
        0 === this._state.errorsCount
          ? t.push("lt-toolbar__status-icon-has-no-errors")
          : (t.push("lt-toolbar__status-icon-has-errors"),
            this._state.isIncompleteResult
              ? (t.push("lt-toolbar__status-icon-has-more-errors"),
                (s = Toolbar.MESSAGES.STATUS_ICON_MORE_ERRORS))
              : this._state.errorsCount >= 9
              ? t.push("lt-toolbar__status-icon-has-9plus-errors")
              : t.push(
                  `lt-toolbar__status-icon-has-${this._state.errorsCount}-errors`
                )),
          this._state.hiddenErrorsCount > 0 &&
            (e.push("lt-toolbar__premium-icon--visible"),
            (this._premiumIconTimeout = window.setTimeout(
              () => this._notifyAboutPremiumIcon(),
              3e3
            )),
            this._state.hiddenErrorsCount < 9
              ? e.push(
                  `lt-toolbar__premium-icon-has-${this._state.hiddenErrorsCount}-errors`
                )
              : e.push("lt-toolbar__premium-icon-has-9plus-errors"),
            0 === this._state.errorsCount &&
              e.push("lt-toolbar__premium-icon--prominent"));
        break;
      case REQUEST_STATUS.PERMISSION_REQUIRED:
        t.push("lt-toolbar__status-icon--permission-required"),
          (s = Toolbar.MESSAGES.STATUS_ICON_PERMISSION_REQUIRED);
        break;
      case REQUEST_STATUS.DISABLED:
        t.push("lt-toolbar__status-icon-disabled"),
          (s = Toolbar.MESSAGES.STATUS_ICON_DISABLED);
        break;
      case REQUEST_STATUS.TEXT_TOO_LONG:
        t.push("lt-toolbar__status-icon-text-too-long"),
          (s = Toolbar.MESSAGES.STATUS_ICON_TEXT_TOO_LONG);
        break;
      case REQUEST_STATUS.UNSUPPORTED_LANGUAGE:
        t.push("lt-toolbar__status-icon--language-unsupported"),
          (s = Toolbar.MESSAGES.STATUS_ICON_LANGUAGE_UNSUPPORTED);
        break;
      case REQUEST_STATUS.FAILED:
        t.push("lt-toolbar__status-icon--failed"),
          (s =
            this._state.exceptionMessage || Toolbar.MESSAGES.STATUS_ICON_FAIL),
          (o = "✖");
        break;
      case REQUEST_STATUS.DISCONNECTED:
        t.push("lt-toolbar__status-icon-disconnected"),
          (s = Toolbar.MESSAGES.STATUS_ICON_RELOAD_MESSAGE),
          (o = "✖");
    }
    (this._controls.statusIcon.className = t.join(" ")),
      (this._controls.statusIcon.title = s),
      (this._controls.statusIcon.textContent = o),
      (this._controls.premiumIcon.className = e.join(" ")),
      this._rootElement && this._rootElement.children[this._rootElement.children.length - 1] !== this._controls.container && this._rootElement.appendChild(this._controls.container);
  }
  _updateDisplaying(t = !1) {
    if (!this._controls.wrapper) return;
    if (
      this._renderOutsideIframe &&
      !this._document.contains(this._referenceArea)
    )
      return void this._hide();
    if (
      (this._domMeasurement.clearCache(),
      !this._appearance.isVisible(this._referenceArea, this._domMeasurement))
    )
      return void this._hide();
    const e = this._appearance.getPosition(
      this._referenceArea,
      Toolbar.TOOLBAR_SIZE,
      this._domMeasurement
    );
    if (!e) return void this._hide();
    const s = { left: e.left };
    e.fixed
      ? ((s.position = "fixed !important"),
        e.top
          ? ((s.top = `${e.top} !important`), (s.bottom = "auto !important"))
          : ((s.top = "auto !important"), (s.bottom = "12px !important")))
      : ((s.position = "absolute !important"),
        (s.top = `${e.top} !important`),
        (s.bottom = "auto !important")),
      t &&
        (s["z-index"] = this._domMeasurement
          .getZIndex(this._referenceArea, this._rootElement)
          .toString()),
      this._domMeasurement.setStyles(this._controls.wrapper, s),
      this._show();
  }
  _hide() {
    this._controls.wrapper &&
      this._visible &&
      ((this._visible = !1),
      this._controls.wrapper.classList.add("lt-toolbar__wrapper-hide"));
  }
  _show() {
    this._controls.wrapper &&
      (this._visible ||
        ((this._visible = !0),
        this._controls.wrapper.classList.remove("lt-toolbar__wrapper-hide")));
  }
  _decreaseSizeIfNeeded() {
    if (!this._controls.wrapper) return;
    if (!this._visible) return;
    const t = this._domMeasurement.getBorderBox(this._controls.wrapper, !1);
    if (this._renderOutsideIframe) {
      const e = this._domMeasurement.getContentBox(this._referenceArea, !1);
      (t.left = t.left - e.left),
        (t.top = t.top - e.top),
        (t.bottom = t.bottom - e.top),
        (t.right = t.right - e.left);
    }
    if (t.top < 0 || t.bottom > window.innerHeight) return;
    const e = {
        left: t.left - 6,
        top: t.top,
        right: t.right,
        bottom: t.bottom - 2
      },
      s = { x: t.left, y: Math.round(t.top) },
      o = {
        x: Math.round(t.left + t.width / 2),
        y: Math.round(t.top + t.height / 2)
      },
      r = { x: t.left, y: Math.round(t.bottom) };
    this.disableRangeMeasurements(),
      this._mirror && this._mirror.enableRangeMeasurements();
    const i = getRangeAtPoint(s);
    let n = getRangeAtPoint(o),
      a = getRangeAtPoint(r);
    this.enableRangeMeasurements(),
      this._mirror && this._mirror.disableRangeMeasurements();
    let _ = null;
    n &&
      n.startOffset > 0 &&
      ((_ = new Range()).setStart(n.startContainer, n.startOffset - 1),
      _.setEnd(n.startContainer, n.startOffset - 1));
    const l = this._mirror ? this._mirror.getCloneElement() : this._inputArea;
    if (i && contains(l, i.startContainer)) {
      const t = i.getBoundingClientRect();
      if (isRectsIntersect(t, e)) return void this._decreaseSize();
    }
    if ((isSameRange(n, i) && (n = null), n && contains(l, n.startContainer))) {
      const t = n.getBoundingClientRect();
      if (isRectsIntersect(t, e)) return void this._decreaseSize();
    }
    if (
      ((isSameRange(a, i) || isSameRange(a, n)) && (a = null),
      a && contains(l, a.startContainer))
    ) {
      const t = a.getBoundingClientRect();
      if (isRectsIntersect(t, e)) return void this._decreaseSize();
    }
    if (
      ((isSameRange(_, i) || isSameRange(_, n) || isSameRange(_, a)) &&
        (_ = null),
      _ && contains(l, _.startContainer))
    ) {
      const t = _.getBoundingClientRect();
      if (isRectsIntersect(t, e)) return void this._decreaseSize();
    }
    this._increaseSize();
  }
  _decreaseSize() {
    this._controls.wrapper &&
      (this._sizeDecreased ||
        ((this._sizeDecreased = !0),
        this._controls.wrapper.classList.add("lt-toolbar-small")));
  }
  _increaseSize() {
    this._controls.wrapper &&
      this._sizeDecreased &&
      ((this._sizeDecreased = !1),
      this._controls.wrapper.classList.remove("lt-toolbar-small"));
  }
  _notifyAboutPremiumIcon() {
    if (this._hasNotifiedAboutPremiumIcon) return;
    this._hasNotifiedAboutPremiumIcon = !0;
    const t = { toolbar: this };
    dispatchCustomEvent(Toolbar.eventNames.notifyAboutPremiumIcon, t);
  }
  _onUnload() {
    this.destroy();
  }
  _onStatusIconClick(t) {
    t.stopImmediatePropagation();
    const e = { toolbar: this };
    if (this._state.requestStatus === REQUEST_STATUS.PERMISSION_REQUIRED)
      dispatchCustomEvent(Toolbar.eventNames.permissionRequiredIconClicked, e);
    else if (this._state.requestStatus === REQUEST_STATUS.FAILED)
      Tracker.trackEvent(
        "Action",
        "dialog:opened",
        "FAILED:" + this._state.exceptionMessage
      ),
        dispatchCustomEvent(Toolbar.eventNames.toggleDialog, e);
    else {
      let t = this._state.requestStatus;
      t === REQUEST_STATUS.COMPLETED && this._state.errorsCount > 0
        ? (t = "HAS_ERRORS")
        : t === REQUEST_STATUS.COMPLETED &&
          this._state.hiddenErrorsCount > 0 &&
          (t = "HAS_ONLY_PREMIUM_ERRORS"),
        Tracker.trackEvent("Action", "dialog:opened", t),
        dispatchCustomEvent(Toolbar.eventNames.toggleDialog, e);
    }
  }
  updateState(t) {
    if (isSameObjects(this._stateForComparison, t)) return;
    this._stateForComparison = t;
    const e = void 0 === t.requestStatus ? this._state.requestStatus : t.requestStatus;
    let s = 0, o = 0;
    e === REQUEST_STATUS.COMPLETED && ((s = void 0 === t.errorsCount ? this._state.errorsCount : t.errorsCount), (o = void 0 === t.errorsCount ? this._state.hiddenErrorsCount : t.hiddenErrorsCount));
    let r = void 0 === t.isIncompleteResult ? this._state.isIncompleteResult : t.isIncompleteResult, i = "";
    e === REQUEST_STATUS.UNSUPPORTED_LANGUAGE && (i = void 0 === t.languageName ? this._state.languageName : t.languageName);
    let n = "";
    e === REQUEST_STATUS.FAILED && (n = void 0 === t.exceptionMessage ? this._state.exceptionMessage : t.exceptionMessage),
      (this._state = { requestStatus: e, errorsCount: s, hiddenErrorsCount: o, isIncompleteResult: r, languageName: i, exceptionMessage: n }),
      window.requestAnimationFrame(() => {
        this._render(), this._updateDisplaying();
      });
  }
  enableRangeMeasurements() {
    this._controls.wrapper &&
      (this._renderOutsideIframe ||
        this._controls.wrapper.classList.remove(
          "lt-toolbar-disable-range-measurement"
        ));
  }
  disableRangeMeasurements() {
    this._controls.wrapper &&
      (this._renderOutsideIframe ||
        this._controls.wrapper.classList.add(
          "lt-toolbar-disable-range-measurement"
        ));
  }
  getState() {
    return this._state;
  }
  getContainer() {
    return this._controls.wrapper;
  }
  destroy() {
    this._eventListeners.forEach(t => {
      t.destroy();
    }),
      (this._eventListeners = []);
    for (const t in this._controls)
      this._controls[t] && this._controls[t].remove();
    (this._controls = {
      container: null,
      wrapper: null,
      statusIcon: null,
      premiumIcon: null
    }),
      this._domMeasurement.clearCache(),
      this._renderInterval && this._renderInterval.destroy(),
      this._decreaseSizeInterval && this._decreaseSizeInterval.destroy(),
      window.removeEventListener("pagehide", this._onUnload, !0),
      clearTimeout(this._premiumIconTimeout),
      this._scrollObserver.destroy();
  }
}
(
  Toolbar.CONTAINER_ELEMENT_NAME = "lt-toolbar"),
  (Toolbar.MESSAGES = {
    STATUS_ICON_RELOAD_MESSAGE: browser.i18n.getMessage("statusIconReload"),
    STATUS_ICON_TOOLTIP: browser.i18n.getMessage("statusIconToolTip"),
    STATUS_ICON_PERMISSION_REQUIRED: browser.i18n.getMessage("statusIconPermissionRequired"),
    STATUS_ICON_TEXT_TOO_LONG: browser.i18n.getMessage("textTooLong"),
    STATUS_ICON_DISABLED: browser.i18n.getMessage("statusIconEnableLT"),
    STATUS_ICON_FAIL: browser.i18n.getMessage("statusIconError"),
    STATUS_ICON_MORE_ERRORS: browser.i18n.getMessage("statusIconMoreErrors"),
    STATUS_ICON_LANGUAGE_UNSUPPORTED: browser.i18n.getMessage("dialogUnsupportedLanguageHeadline")
  }),
  (Toolbar.TOOLBAR_SIZE = { width: 20, height: 20 }),
  (Toolbar.eventNames = {
    permissionRequiredIconClicked: "lt-toolbar.permissionRequiredIconClicked",
    toggleDialog: "lt-toolbar.toggleDialog",
    notifyAboutPremiumIcon: "lt-toolbar.notifyAboutPremiumIcon"
  });
