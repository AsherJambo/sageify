import { motion } from 'framer-motion';
import yairImg from '@/assets/team-yair.jpg';
import asherImg from '@/assets/team-asher.jpg';

const team = [
  { name: 'ד"ר יאיר נעם', role: 'מייסד שותף', desc: 'פסיכולוג תעסוקתי, מומחה באבחון מיומנויות. לשעבר ראש ענף המיון של צה"ל.', img: yairImg },
  { name: 'אשר שטיינברגר', role: 'מייסד שותף', desc: 'יזם ומנהל פרויקטים מערכתיים, מומחה בחיבור בין אנשים להזדמנויות.', img: asherImg },
];

const LandingTeam = () => (
  <section className="py-16 md:py-24">
    <div className="max-w-2xl mx-auto px-6">
      <motion.h2
        className="text-2xl md:text-[2.25rem] font-bold text-right mb-10 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        הצוות
      </motion.h2>

      <div className="space-y-8">
        {team.map((t, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-5"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.12, duration: 0.8 }}
          >
            <img
              src={t.img}
              alt={t.name}
              className="w-20 h-20 md:w-24 md:h-24 rounded-lg object-cover grayscale-[15%] shrink-0"
              loading="lazy"
            />
            <div className="pt-0.5">
              <h3 className="text-lg font-bold font-display">{t.name}</h3>
              <p className="text-primary text-xs font-semibold mb-2">{t.role}</p>
              <p className="text-muted-foreground text-[0.95rem] leading-[1.75]">{t.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingTeam;
