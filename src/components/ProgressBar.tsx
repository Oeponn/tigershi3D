import styles from "./ProgressBar.module.scss";

function ProgressBar() {
  return (
    <div className={styles.progressBarContainer}>
      <div className={styles.progressBar}></div>
    </div>
  );
}

export default ProgressBar;
