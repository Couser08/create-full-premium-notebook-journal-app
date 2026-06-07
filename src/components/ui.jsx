import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../lib/utils";

export function Button({ className, variant = "default", size = "md", ...props }) {
  const variants = {
    default: "bg-primary text-primary-foreground shadow-card hover:bg-primary/90",
    ghost: "bg-transparent text-muted-foreground hover:bg-lavender hover:text-primary",
    outline: "border border-border bg-background text-foreground hover:bg-muted",
    soft: "bg-lavender text-primary hover:bg-primary/12"
  };
  const sizes = {
    icon: "size-9 p-0",
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm"
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function IconButton({ children, className, ...props }) {
  return (
    <Button variant="ghost" size="icon" className={cn("rounded-full", className)} {...props}>
      {children}
    </Button>
  );
}

export function Card({ children, className, animate = true, ...props }) {
  const baseClass = cn("rounded-xl border border-border bg-background shadow-card", className);
  
  if (!animate) {
    return (
      <div className={baseClass} {...props}>
        {children}
      </div>
    );
  }
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={baseClass}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function Badge({ children, className }) {
  return (
    <span className={cn("inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground", className)}>
      {children}
    </span>
  );
}

export function Separator({ className }) {
  return <div className={cn("h-px bg-border", className)} />;
}

export function CustomSelect({ value, onChange, options, icon: Icon, className }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find(o => o.value === value) || options[0];

  return (
    <div className={cn("relative", className)} ref={ref}>
      <button
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="flex h-11 w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 outline-none transition focus:border-violet-400 focus:ring-3 focus:ring-violet-100"
      >
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="size-4 text-gray-400" /> : selected?.icon && <selected.icon className="size-4 text-gray-400" />}
          <span className="truncate">{selected?.label}</span>
        </div>
        <ChevronDown className={cn("size-4 text-gray-400 transition-transform", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 max-h-52 w-full overflow-y-auto rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl"
          >
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={(e) => { e.preventDefault(); onChange(opt.value); setOpen(false); }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition",
                  value === opt.value
                    ? "bg-violet-50 text-violet-700 font-semibold"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {opt.icon && (
                  <opt.icon
                    className={cn(
                      "size-4",
                      value === opt.value ? "text-violet-600" : "text-gray-400"
                    )}
                  />
                )}
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
