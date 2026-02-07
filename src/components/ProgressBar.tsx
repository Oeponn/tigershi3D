import styles from "./ProgressBar.module.scss";

function ProgressBar({
  progressBarRef,
}: {
  progressBarRef?: React.Ref<HTMLDivElement>;
}) {
  return (
    <div ref={progressBarRef} className={styles.progressBarContainer}>
      <div className={styles.progressBar}></div>
    </div>
  );
}

export default ProgressBar;
