export default function SectionHeading({ label }: { label: string }) {
  return (
    <>
      <div className="doc-section-h">{label}</div>
      <hr className="doc-divider doc-section-h-divider" />
    </>
  )
}
