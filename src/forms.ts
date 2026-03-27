import './forms.css'
import { dntForms } from './state'
export type { DntForms } from './namespace'
export { dntForms }

// prevent submit on enter
document.addEventListener(
  'keydown',
  (ev) => {
    if (ev.key === 'Enter' && ev.target instanceof HTMLInputElement) {
      ev.preventDefault()
      return false
    }
  },
  { passive: false },
)

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll<HTMLDivElement>('[data-dnt-form-control]').forEach((inp) => {
    if (inp.querySelector('[type="tel"]')) {
      new dntForms.FormPhone(inp)
    } else {
      new dntForms.FormControl(inp)
    }
  })

  document.querySelectorAll<HTMLDivElement>('[data-dnt-form-combobox]').forEach((inp) => {
    new dntForms.FormCombobox(inp)
  })
})