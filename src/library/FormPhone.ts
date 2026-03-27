import type { DntForms } from '@dnt-theme/forms'
import { FormControl } from './FormControl'

export class FormPhone extends FormControl implements DntForms.FormPhone {
  constructor(container: HTMLDivElement) {
    super(container)

    this.inputNode.addEventListener('input', () => this.format())

    // Установка начального значения
    this.inputNode.dispatchEvent(new Event('input'))
  }

  format() {
    const input = this.inputNode
    let { value } = input

    if (value.indexOf('+7') === 0) {
      value = value.replace(/\D/g, '')
    } else {
      value = value.replace(/\D/g, '')
      if (value.length === 10) {
        value = `7${value}`
      } else if (value.indexOf('8') === 0) {
        value = `7${value.slice(1)}`
      } else if (value.length) {
        value = `7${value}`
      }
    }

    if (!value) {
      input.value = ''
      return
    }

    // Ограничиваем длину до 11 цифр
    if (value.length > 11) {
      value = value.slice(0, 11)
    }

    // Форматируем телефон
    if (value.length <= 1) {
      input.value = '+7'
    } else if (value.length <= 4) {
      input.value = `+7 (${value.slice(1)}`
    } else if (value.length <= 7) {
      input.value = `+7 (${value.slice(1, 4)}) ${value.slice(4)}`
    } else if (value.length <= 9) {
      input.value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(7)}`
    } else {
      input.value = `+7 (${value.slice(1, 4)}) ${value.slice(4, 7)}-${value.slice(
        7,
        9,
      )}-${value.slice(9)}`
    }
  }
}

declare module '@dnt-theme/forms' {
  namespace DntForms {
    export interface FormPhone extends FormControl {
      format(): void
    }
  }
}
