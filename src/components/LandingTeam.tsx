import { motion } from 'framer-motion';
import yairImg from '@/assets/team-yair.jpg';
import asherImg from '@/assets/team-asher.jpg';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const team = [
  { name: 'ד"ר יאיר נעם', role: 'מייסד שותף', desc: 'פסיכולוג תעסוקתי, מומחה באבחון מיומנויות. לשעבר ראש ענף המיון של צה"ל.', img: yairImg },
  { name: 'אשר שטיינברגר', role: 'מייסד שותף', desc: 'יזם ומנהל פרויקטים מערכתיים, מומחה בחיבור בין אנשים להזדמנויות.', img: asherImg },
];

const LandingTeam = () => (
  <section className="bg-muted/20 py-24 md:py-32 relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-6 relative z-10">
      <motion.h2
        className="text-3xl md:text-[2.75rem] font-bold text-center mb-16 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        הצוות
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {team.map((t, i) => (
          <motion.div
            key={i}
            className="border border-border bg-card rounded-2xl p-8 text-center shadow-[var(--shadow-card)]"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
          >
            <img
              src={t.img}
              alt={t.name}
              className="w-28 h-28 rounded-2xl object-cover mx-auto mb-6 border-2 border-border shadow-[var(--shadow-card)] grayscale-[10%]"
              loading="lazy"
            />
            <h3 className="text-xl font-bold mb-1 font-serif">{t.name}</h3>
            <p className="text-primary text-sm font-bold mb-3 tracking-wide">{t.role}</p>
            <p className="text-muted-foreground leading-relaxed text-base">{t.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingTeam;
