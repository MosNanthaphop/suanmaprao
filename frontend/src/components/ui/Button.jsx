import Icon from './Icon.jsx';

const variants = {
  primary: 'bg-green text-white hover:bg-green-dark',
  quiet: 'border border-line bg-transparent text-slate-600 hover:bg-white',
  subtle: 'border border-green/25 bg-transparent text-green-dark hover:bg-green/5',
  text: 'bg-transparent text-green hover:underline'
};

export default function Button({ children, icon, variant = 'primary', className = '', ...props }) {
  return (
    <button
      className={'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-55 ' +
        (variants[variant] || variants.primary) + ' ' + className}
      {...props}
    >
      {icon && <Icon name={icon} className="size-[17px]" />}
      {children}
    </button>
  );
}
