import Image from 'next/image';
import styles from './SkillCard.module.css';

interface SkillCardProps {
  courseName?: string;
  imageUrl?: string;
  backgroundColor?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageTop?: string;
  imageRight?: string;
}

export default function SkillCard({
  courseName = 'Йога',
  imageUrl = '/img/image_9.png',
  backgroundColor = '#FF6B6B',
  imageWidth = '58%',
  imageHeight = '119%',
  imageTop = '-230px',
  imageRight = '-205px',
}: SkillCardProps) {
  return (
    <div>
      <div className={styles.main__box} style={{ backgroundColor }}>

          <Image
            width={500}
            height={500}
            className={styles.main__image}
            style={{
              position: 'relative',
              width: imageWidth,
              height: imageHeight,
              top: imageTop,
              right: imageRight,
            }}
            src={imageUrl}
            alt={courseName}
            priority
          />
        <h1 className={styles.main__title}>{courseName}</h1>
      </div>
    </div>
  );
}
