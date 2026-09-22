import styles from './Button.module.css'

export default function Button({ children, variant='outline', size='md', onClick, disabled=false, type='button', className='', as:Tag='button', ...props }) {
  const cls = [styles.btn, styles[variant], styles[`s_${size}`], disabled&&styles.disabled, className].filter(Boolean).join(' ')
  return (
    <Tag type={Tag==='button'?type:undefined} className={cls} onClick={onClick} disabled={Tag==='button'?disabled:undefined} aria-disabled={disabled} {...props}>
      {children}
    </Tag>
  )
}
