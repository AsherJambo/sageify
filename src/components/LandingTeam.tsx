import { motion } from 'framer-motion';
import yairImg from '@/assets/team-yair.jpg';
import asherImg from '@/assets/team-asher.jpg';

const team = [
  { name: 'ד"ר יאיר נעם', role: 'מייסד שותף', desc: 'פסיכולוג תעסוקתי, מומחה באבחון מיומנויות. לשעבר ראש ענף המיון של צה"ל.', img: yairImg },
  { name: 'אשר שטיינברגר', role: 'מייסד שותף', desc: 'יזם ומנהל פרויקטים מערכתיים, מומחה בחיבור בין אנשים להזדמנויות.', img: asherImg },
];

const LandingTeam = () => (
  <section className="bg-muted/20 py-24 md:py-32 relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-6 relative z-10">
      <motion.h2
        className="text-3xl md:text-[2.5rem] font-bold text-right mb-14 leading-tight"
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        הצוות
      </motion.h2>

      {/* Horizontal layout per person — less card-like, more editorial */}
      <div className="space-y-10">
        {team.map((t, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-6 md:gap-8"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <img
              src={t.img}
              alt={t.name}
              className="w-24 h-24 md:w-28 md:h-28 rounded-2xl object-cover border-2 border-border shadow-[var(--shadow-card)] grayscale-[10%] shrink-0"
              loading="lazy"
            />
            <div className="pt-1">
              <h3 className="text-xl font-bold mb-1 font-serif">{t.name}</h3>
              <p className="text-primary text-sm font-bold mb-3 tracking-wide">{t.role}</p>
              <p className="text-muted-foreground leading-[1.8] text-base">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingTeam;
