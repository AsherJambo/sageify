import { motion } from 'framer-motion';
import yairImg from '@/assets/team-yair.jpg';
import asherImg from '@/assets/team-asher.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const team = [
  {
    name: 'ד"ר יאיר נעם',
    role: 'מייסד שותף – מדע',
    desc: 'פסיכולוג תעסוקתי, מומחה באבחון מיומנויות. לשעבר ראש ענף המיון של צה"ל.',
    img: yairImg,
  },
  {
    name: 'אשר שטיינברגר',
    role: 'מייסד שותף – טכנולוגיה',
    desc: 'יזם ומנהל פרויקטים מערכתיים, מומחה בחיבור בין אנשים להזדמנויות.',
    img: asherImg,
  },
];

const LandingTeam = () => {
  return (
    <section className="bg-primary/[0.03] py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          הצוות
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {team.map((t, i) => (
            <motion.div
              key={i}
              className="border border-border/50 bg-card rounded-lg p-8 text-center shadow-[var(--shadow-card)]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
            >
              <img
                src={t.img}
                alt={t.name}
                className="w-24 h-24 rounded-full object-cover mx-auto mb-5 border-2 border-border/60 shadow-sm grayscale-[20%]"
                loading="lazy"
              />
              <h3 className="text-xl font-bold mb-1 font-serif">{t.name}</h3>
              <p className="text-accent text-xs font-semibold mb-3 tracking-wide">{t.role}</p>
              <p className="text-muted-foreground leading-relaxed text-[15px]">{t.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTeam;
