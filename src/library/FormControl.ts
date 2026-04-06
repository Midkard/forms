import type { DntForms } from '@dnt-theme/forms'

export class FormControl implements DntForms.FormControl {
  inputNode: HTMLInputElement
  container: HTMLDivElement
  clearButton?: HTMLButtonElement

  constructor(container: HTMLDivElement) {
    this.container = container
    const input = container.querySelector('input')!
    this.inputNode = input as HTMLInputElement
    if (!input) {
      return
    }
    const label = container.querySelector('label')
    if (label && !label.htmlFor) {
      label.htmlFor = input.id
    }
    if (['text', 'tel', 'datetime-local', 'date', 'datetime', 'time'].includes(input.type)) {
      this.toggleEmptyClass()
      input.addEventListener('input', this.toggleEmptyClass)
      input.addEventListener('change', this.toggleEmptyClass)
      this.observeValueChanges()
    }

    if (this.container.classList.contains('form-control_clearable')) {
      this.createClearButton()
    }
  }

  observeValueChanges = () => {
    const input = this.inputNode
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')
    const originalSetter = descriptor?.set

    if (!originalSetter) return

    Object.defineProperty(input, 'value', {
      get: () => descriptor.get?.call(input),
      set: (newValue: string) => {
        originalSetter.call(input, newValue)
        this.toggleEmptyClass()
      },
      configurable: true,
    })
  }

  createClearButton = () => {
    const btn = document.createElement('button')
    btn.classList.add('btn-i', 'form-control__clear')
    btn.ariaLabel = 'Очистить'
    btn.innerHTML = '<dnt-icon icon="close"></dnt-icon>'
    this.inputNode.insertAdjacentElement('afterend', btn)
    btn.addEventListener(
      'click',
      (ev) => {
        ev.preventDefault()
        this.inputNode.value = ''
        this.inputNode.dispatchEvent(new Event('change', { bubbles: true }))
        this.inputNode.focus({})
      },
      { passive: false },
    )
    this.clearButton = btn
  }

  toggleEmptyClass = () => {
    if (this.inputNode.value === '') {
      this.container.classList.add('form-control_empty')
    } else {
      this.container.classList.remove('form-control_empty')
    }
  }
}

declare module '@dnt-theme/forms' {
  namespace DntForms {
    export interface FormControl {
      inputNode: HTMLInputElement
      container: HTMLDivElement
      clearButton?: HTMLButtonElement
      createClearButton(): void
      toggleEmptyClass(): void
    }
  }
}
