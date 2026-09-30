// A titled card that groups related form fields. `action` sits beside the title (e.g. a switch).
const FormSection = ({ id, title, description, action, children }) => (
  <section className="card" aria-labelledby={`${id}-title`}>
    <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <h2 id={`${id}-title`} className="section-title">
          {title}
        </h2>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
    {children && <div className="space-y-4 border-t border-border px-5 py-5 sm:px-6">{children}</div>}
  </section>
);

export default FormSection;
