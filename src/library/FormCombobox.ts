/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 */

import type { DntForms } from '@dnt-theme/forms'
import { FormControl } from './FormControl'

interface Props {
  buttonNode?: HTMLButtonElement
}

export class FormCombobox extends FormControl implements DntForms.FormCombobox {
  _openButtonNode?: HTMLButtonElement
  _listboxNode: HTMLUListElement
  _comboboxHasVisualFocus: boolean
  _listboxHasVisualFocus: boolean
  _hasHover: boolean
  _isNone: boolean
  _isList: boolean
  _isBoth: boolean
  _allOptions: HTMLLIElement[]
  _option: HTMLLIElement | null
  _firstOption: HTMLLIElement | null
  _lastOption: HTMLLIElement | null
  _filteredOptions: HTMLLIElement[]
  _filter: string
  _observer: MutationObserver
  _position = 'down' as 'up' | 'down'

  constructor(container: HTMLDivElement, { buttonNode }: Props = {}) {
    super(container)
    this._openButtonNode = buttonNode
    this._listboxNode = container.querySelector('[role="listbox"]')!

    this._comboboxHasVisualFocus = false
    this._listboxHasVisualFocus = false

    this._hasHover = false

    this._isNone = false
    this._isList = false
    this._isBoth = false

    this._allOptions = []

    this._option = null
    this._firstOption = null
    this._lastOption = null

    this._filteredOptions = []
    this._filter = ''

    let autocomplete = this.inputNode.getAttribute('aria-autocomplete')

    if (typeof autocomplete === 'string') {
      autocomplete = autocomplete.toLowerCase()
      this._isNone = autocomplete === 'none'
      this._isList = autocomplete === 'list'
      this._isBoth = autocomplete === 'both'
    } else {
      // default value of autocomplete
      this._isNone = true
    }

    this.inputNode.addEventListener('keydown', this._onComboboxKeyDown)
    this.inputNode.addEventListener('keyup', this._onComboboxKeyUp)
    this.inputNode.addEventListener('click', this._onComboboxClick)
    this.inputNode.addEventListener('focus', this._onComboboxFocus)
    this.inputNode.addEventListener('blur', this._onComboboxBlur)

    document.body.addEventListener('pointerup', this._onBackgroundPointerUp, true)

    // initialize pop up menu

    this._listboxNode.addEventListener('pointerover', this._onListboxPointerover)
    this._listboxNode.addEventListener('pointerout', this._onListboxPointerout)

    this._observer = new MutationObserver((mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          this._updateOptions()
          break
        }
      }
    })

    this._observer.observe(this._listboxNode, { childList: true })

    this._updateOptions()

    // Open Button
    if (this._openButtonNode) {
      this._openButtonNode.addEventListener('click', this._onButtonClick)
    }
  }

  destroy() {
    document.body.removeEventListener('pointerup', this._onBackgroundPointerUp)
    this._observer.disconnect()
    window.removeEventListener('resize', this._onResize)
    window.removeEventListener('scroll', this._onResize)
  }

  _updateOptions() {
    // Traverse the element children of domNode: configure each with
    // option role behavior and store reference in.options array.
    const nodes = this._listboxNode.querySelectorAll('li')
    this._allOptions.forEach((node) => {
      node.removeEventListener('click', this._onOptionClick)
      node.removeEventListener('pointerover', this._onOptionPointerover)
      node.removeEventListener('pointerout', this._onOptionPointerout)
    })
    this._allOptions = []
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]!
      this._allOptions.push(node)

      node.addEventListener('click', this._onOptionClick)
      node.addEventListener('pointerover', this._onOptionPointerover)
      node.addEventListener('pointerout', this._onOptionPointerout)
    }

    this._filterOptions()
  }

  _getLowercaseContent(node: HTMLLIElement) {
    return node.textContent.toLowerCase()
  }

  _isReversedOrder() {
    return this._position === 'up'
  }

  _isOptionInView(option: HTMLLIElement) {
    const bounding = option.getBoundingClientRect()
    return (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth)
    )
  }

  _setActiveDescendant(option: HTMLLIElement | null | false) {
    if (option && this._listboxHasVisualFocus) {
      this.inputNode.setAttribute('aria-activedescendant', option.id)
      if (!this._isOptionInView(option)) {
        option.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    } else {
      this.inputNode.setAttribute('aria-activedescendant', '')
    }
  }

  _setValue(value: string) {
    this._filter = value
    this.inputNode.value = this._filter
    this.inputNode.setSelectionRange(this._filter.length, this._filter.length)
    this._filterOptions()
  }

  _setOption(option: HTMLLIElement | null, flag?: boolean) {
    if (typeof flag !== 'boolean') {
      flag = false
    }

    if (option) {
      this._option = option
      this._setCurrentOptionStyle(this._option)
      this._setActiveDescendant(this._option)

      if (this._isBoth) {
        this.inputNode.value = this._option.textContent
        if (flag) {
          this.inputNode.setSelectionRange(
            this._option.textContent.length,
            this._option.textContent.length,
          )
        } else {
          this.inputNode.setSelectionRange(this._filter.length, this._option.textContent.length)
        }
      }
    }
  }

  _setVisualFocusCombobox() {
    this._listboxNode.classList.remove('form-listbox_focus')
    this.container.classList.add('form-control_focus') // set the focus class to the parent for easier styling
    this._comboboxHasVisualFocus = true
    this._listboxHasVisualFocus = false
    this._setActiveDescendant(false)
  }

  _setVisualFocusListbox() {
    this.container.classList.remove('form-control_focus')
    this._comboboxHasVisualFocus = false
    this._listboxHasVisualFocus = true
    this._listboxNode.classList.add('form-listbox_focus')
    this._setActiveDescendant(this._option)
  }

  _removeVisualFocusAll() {
    this.container.classList.remove('form-control_focus')
    this._comboboxHasVisualFocus = false
    this._listboxHasVisualFocus = false
    this._listboxNode.classList.remove('form-listbox_focus')
    this._option = null
    this._setActiveDescendant(false)
  }

  // ComboboxAutocomplete Events

  _filterOptions() {
    // do not filter any options if autocomplete is none
    if (this._isNone) {
      this._filter = ''
    }

    let option: HTMLLIElement | null = null
    const currentOption = this._option
    const filter = this._filter.toLowerCase()

    this._filteredOptions = []

    for (let i = 0; i < this._allOptions.length; i++) {
      option = this._allOptions[i]!
      if (filter.length === 0 || this._getLowercaseContent(option).indexOf(filter) === 0) {
        this._filteredOptions.push(option)
        option.style.display = ''
      } else {
        option.style.display = 'none'
      }
    }

    // Use populated options array to initialize firstOption and lastOption.
    const numItems = this._filteredOptions.length
    if (numItems > 0) {
      this._firstOption = this._filteredOptions[0]!
      this._lastOption = this._filteredOptions[numItems - 1]!

      if (currentOption && this._filteredOptions.indexOf(currentOption) >= 0) {
        option = currentOption
      } else {
        option = this._firstOption
      }
      this._listboxNode.style.display = ''
    } else {
      this._firstOption = null
      option = null
      this._lastOption = null
      this._listboxNode.style.display = 'none'
    }

    return option
  }

  _setCurrentOptionStyle(option: HTMLLIElement | false | null) {
    for (let i = 0; i < this._filteredOptions.length; i++) {
      const opt = this._filteredOptions[i]!
      if (opt === option) {
        opt.setAttribute('aria-selected', 'true')
        if (
          this._listboxNode.scrollTop + this._listboxNode.offsetHeight <
          opt.offsetTop + opt.offsetHeight
        ) {
          this._listboxNode.scrollTop =
            opt.offsetTop + opt.offsetHeight - this._listboxNode.offsetHeight
        } else if (this._listboxNode.scrollTop > opt.offsetTop + 2) {
          this._listboxNode.scrollTop = opt.offsetTop
        }
      } else {
        opt.removeAttribute('aria-selected')
      }
    }
  }

  _getPreviousOption(currentOption: HTMLLIElement | null) {
    if (currentOption && currentOption !== this._firstOption) {
      const index = this._filteredOptions.indexOf(currentOption)
      return this._filteredOptions[index - 1]!
    }
    return this._lastOption
  }

  _getNextOption(currentOption: HTMLLIElement | null) {
    if (currentOption && currentOption !== this._lastOption) {
      const index = this._filteredOptions.indexOf(currentOption)
      return this._filteredOptions[index + 1]!
    }
    return this._firstOption
  }

  /* MENU DISPLAY METHODS */

  _doesOptionHaveFocus() {
    return this.inputNode.getAttribute('aria-activedescendant') !== ''
  }

  _isOpen() {
    return this._listboxNode.classList.contains('form-listbox_open')
  }

  _isClosed() {
    return !this._listboxNode.classList.contains('form-listbox_open')
  }

  _hasOptions() {
    return this._filteredOptions.length
  }

  _isPrintableCharacter(str: string) {
    return str?.length === 1 && str.match(/\S| /)
  }

  _selectOption(option: HTMLLIElement) {
    this._setValue(option.getAttribute('value') || option.textContent)
    this.inputNode.dispatchEvent(new Event('change'))
  }

  open = () => {
    window.addEventListener('resize', this._onResize, { passive: true })
    window.addEventListener('scroll', this._onResize, { passive: true })
    this._onResize()
    this._listboxNode.classList.add('form-listbox_open')
    this.inputNode.setAttribute('aria-expanded', 'true')
    this._openButtonNode?.setAttribute('aria-expanded', 'true')
  }

  close = (force?: boolean) => {
    if (typeof force !== 'boolean') {
      force = false
    }

    if (
      force ||
      (!this._comboboxHasVisualFocus && !this._listboxHasVisualFocus && !this._hasHover)
    ) {
      this._setCurrentOptionStyle(false)
      this._listboxNode.classList.remove('form-listbox_open')
      this.inputNode.setAttribute('aria-expanded', 'false')
      this._openButtonNode?.setAttribute('aria-expanded', 'false')
      this._setActiveDescendant(false)
      this.container.classList.add('form-control_focus')
      window.removeEventListener('resize', this._onResize)
      window.removeEventListener('scroll', this._onResize)
    }
  }

  /* combobox Events */
  _onResize = () => {
    const bottomSpace = window.innerHeight - this.inputNode.getBoundingClientRect().bottom
    const topSpace = this.inputNode.getBoundingClientRect().top
    if (bottomSpace < 300 && topSpace > bottomSpace) {
      this._position = 'up'
      this.container.classList.add('form-control_upper-listbox')
    } else {
      this._position = 'down'
      this.container.classList.remove('form-control_upper-listbox')
    }
  }

  _onComboboxKeyDown = (event: KeyboardEvent) => {
    let flag = false
    const altKey = event.altKey

    if (event.ctrlKey || event.shiftKey) {
      return
    }

    switch (event.key) {
      case 'Enter':
        if (this._listboxHasVisualFocus) {
          if (this._option) {
            this._selectOption(this._option)
          }
        }
        this.close(true)
        this._setVisualFocusCombobox()
        flag = true
        break

      case 'Down':
      case 'ArrowDown':
        if (this._filteredOptions.length > 0) {
          if (altKey) {
            this.open()
          } else {
            this.open()
            if (this._listboxHasVisualFocus || (this._isBoth && this._filteredOptions.length > 1)) {
              this._setOption(
                this._isReversedOrder()
                  ? this._getPreviousOption(this._option)
                  : this._getNextOption(this._option),
                true,
              )
              this._setVisualFocusListbox()
            } else {
              this._setOption(this._isReversedOrder() ? this._lastOption : this._firstOption, true)
              this._setVisualFocusListbox()
            }
          }
        }
        flag = true
        break

      case 'Up':
      case 'ArrowUp':
        if (this._hasOptions()) {
          if (this._listboxHasVisualFocus) {
            this._setOption(
              this._isReversedOrder()
                ? this._getNextOption(this._option)
                : this._getPreviousOption(this._option),
              true,
            )
          } else {
            this.open()
            if (!altKey) {
              this._setOption(this._isReversedOrder() ? this._firstOption : this._lastOption, true)
              this._setVisualFocusListbox()
            }
          }
        }
        flag = true
        break

      case 'Esc':
      case 'Escape':
        if (this._isOpen()) {
          this.close(true)
          this._filter = this.inputNode.value
          this._filterOptions()
          this._setVisualFocusCombobox()
        } else {
          this._setValue('')
        }
        this._option = null
        flag = true
        break

      case 'Tab':
        this.close(true)
        if (this._listboxHasVisualFocus) {
          if (this._option) {
            this._setOption(this._option)
          }
        }
        break

      case 'Home':
        this.inputNode.setSelectionRange(0, 0)
        flag = true
        break

      case 'End':
        this.inputNode.setSelectionRange(this.inputNode.value.length, this.inputNode.value.length)
        flag = true
        break

      default:
        break
    }

    if (flag) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  _onComboboxKeyUp = (event: KeyboardEvent) => {
    let flag = false
    let option = null as HTMLLIElement | null
    const char = event.key

    if (this._isPrintableCharacter(char)) {
      this._filter += char
    }

    // this is for the case when a selection in the textbox has been deleted
    if (this.inputNode.value.length < this._filter.length) {
      this._filter = this.inputNode.value
      this._option = null
      this._filterOptions()
    }

    if (event.key === 'Escape' || event.key === 'Esc') {
      return
    }

    switch (event.key) {
      case 'Backspace':
        this._setVisualFocusCombobox()
        this._setCurrentOptionStyle(false)
        this._filter = this.inputNode.value
        this._option = null
        this._filterOptions()
        flag = true
        break

      case 'Left':
      case 'ArrowLeft':
      case 'Right':
      case 'ArrowRight':
      case 'Home':
      case 'End':
        if (this._isBoth) {
          this._filter = this.inputNode.value
        } else {
          this._option = null
          this._setCurrentOptionStyle(false)
        }
        this._setVisualFocusCombobox()
        flag = true
        break

      default:
        if (this._isPrintableCharacter(char)) {
          this._setVisualFocusCombobox()
          this._setCurrentOptionStyle(false)
          flag = true

          if (this._isList || this._isBoth) {
            option = this._filterOptions()
            if (option) {
              if (this._isClosed() && this.inputNode.value.length) {
                this.open()
              }

              if (
                this._getLowercaseContent(option).indexOf(this.inputNode.value.toLowerCase()) === 0
              ) {
                this._option = option
                if (this._isBoth || this._listboxHasVisualFocus) {
                  this._setCurrentOptionStyle(option)
                  if (this._isBoth) {
                    this._setOption(option)
                  }
                }
              } else {
                this._option = null
                this._setCurrentOptionStyle(false)
              }
            } else {
              this.close()
              this._option = null
              this._setActiveDescendant(false)
            }
          } else if (this.inputNode.value.length) {
            this.open()
          }
        }

        break
    }

    if (flag) {
      event.stopPropagation()
      event.preventDefault()
    }
  }

  _onComboboxClick = () => {
    if (this._isOpen()) {
      this.close(true)
    } else {
      this.open()
    }
  }

  _onComboboxFocus = () => {
    this._filter = this.inputNode.value
    this._filterOptions()
    this._setVisualFocusCombobox()
    this._option = null
    this._setCurrentOptionStyle(null)
  }

  _onComboboxBlur = () => {
    this._removeVisualFocusAll()
  }

  _onBackgroundPointerUp = (event: PointerEvent) => {
    if (
      event.target instanceof Node &&
      !this.inputNode.contains(event.target) &&
      !this._listboxNode.contains(event.target) &&
      !this._openButtonNode?.contains(event.target)
    ) {
      this._comboboxHasVisualFocus = false
      this._setCurrentOptionStyle(null)
      this._removeVisualFocusAll()
      setTimeout(() => this.close(true), 300)
    }
  }

  _onButtonClick = () => {
    if (this._isOpen()) {
      this.close(true)
    } else {
      this.open()
    }
    this.inputNode.focus()
    this._setVisualFocusCombobox()
  }

  /* Listbox Events */

  _onListboxPointerover = () => {
    this._hasHover = true
  }

  _onListboxPointerout = () => {
    this._hasHover = false
    setTimeout(() => this.close(false), 300)
  }

  // Listbox Option Events

  _onOptionClick = (event: PointerEvent) => {
    if (event.target instanceof Element) {
      const option = event.target.closest('li')
      if (option) {
        this._selectOption(option)
      }
    }
    this.close(true)
  }

  _onOptionPointerover = () => {
    this._hasHover = true
    this.open()
  }

  _onOptionPointerout = () => {
    this._hasHover = false
    setTimeout(() => this.close(false), 300)
  }
}

declare module '@dnt-theme/forms' {
  namespace DntForms {
    export interface FormCombobox extends FormControl {
      destroy(): void
      open(): void
      close(force?: boolean): void
    }
  }
}
