/*! (C) Copyright 2018 LanguageTooler GmbH. All rights reserved. */
class DOMWalker {
  constructor(t, e = t) {
    (this._rootNode = t), (this._currentNode = e);
  }
  next(t = !1) {
    if (!this._currentNode) return this._currentNode;
    if (!t && this._currentNode.firstChild)
      this._currentNode = this._currentNode.firstChild;
    else if (this._currentNode.nextSibling)
      this._currentNode =
        this._currentNode === this._rootNode
          ? null
          : this._currentNode.nextSibling;
    else {
      for (
        ;
        !this._currentNode.nextSibling && this._currentNode !== this._rootNode;

      )
        this._currentNode = this._currentNode.parentNode;
      this._currentNode =
        this._currentNode === this._rootNode
          ? null
          : this._currentNode.nextSibling;
    }
    return this._currentNode;
  }
  node() {
    return this._currentNode;
  }
}
