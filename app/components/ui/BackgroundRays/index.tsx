import styles from './styles.module.scss';

interface BackgroundRaysProps {
  className?: string;
}

const BackgroundRays = ({ className = '' }: BackgroundRaysProps) => {
  return <div className={`${styles.rayContainer} ${className}`}></div>;
};

export default BackgroundRays;
