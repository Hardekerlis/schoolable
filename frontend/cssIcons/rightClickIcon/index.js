import styles from './styles.module.sass'

const RightClickIcon = ({ className }) => {

  const name = (className) ? `${styles.rightClickIcon} ${className}` : styles.rightClickIcon;

  return(
    <div className={name}>
      <div className={styles.left}></div>
      <div className={styles.right}></div>
      <div className={styles.base}></div>
    </div>
  )

}

export default RightClickIcon;
