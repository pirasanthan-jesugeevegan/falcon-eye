import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { Home, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="text-center space-y-8 max-w-md mx-auto">
        {/* Animated 404 Number */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 20,
            delay: 0.2,
          }}
          className="relative"
        >
          <h1 className="text-9xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            404
          </h1>

          {/* Floating elements around 404 */}
          <motion.div
            animate={{
              y: [-10, 10, -10],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-4 -right-4 text-primary/30"
          >
            <Zap size={24} />
          </motion.div>

          <motion.div
            animate={{
              y: [10, -10, 10],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}
            className="absolute -bottom-4 -left-4 text-primary/30"
          >
            <Zap size={20} />
          </motion.div>
        </motion.div>

        {/* Main Message */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            delay: 0.4,
          }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-semibold text-foreground">
            Oops! Page Not Found
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Looks like you&apos;ve ventured into the unknown digital realm.
            Don&apos;t worry, even the best explorers get lost sometimes!
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 100,
            delay: 0.6,
          }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Button asChild className="group relative overflow-hidden">
            <Link to="/">
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <Home className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
              Go Home
            </Link>
          </Button>
        </motion.div>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="absolute inset-0 pointer-events-none"
        >
          {/* Floating dots */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.2,
              }}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default NotFoundPage;
