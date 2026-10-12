import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Política editorial y correcciones",
  description:
    "Conoce los principios editoriales, el uso de fuentes, la transparencia y el proceso para solicitar una corrección en Montecristi.net.",
  alternates: { canonical: "/politica-editorial" },
};

const sections = [
  {
    title: "Cobertura y propósito",
    paragraphs: [
      "Montecristi.net informa sobre Montecristi, la Línea Noroeste y los asuntos nacionales que afectan a sus comunidades. Nuestro objetivo es ofrecer información clara, útil y oportuna.",
      "La cobertura local prioriza las comunidades de San Fernando de Montecristi, Pepillo Salcedo (Manzanillo), Guayubín, Villa Vásquez, Castañuelas y Las Matas de Santa Cruz.",
    ],
  },
  {
    title: "Fuentes, atribución y contexto",
    paragraphs: [
      "Las noticias pueden basarse en documentos públicos, comunicaciones oficiales, entrevistas, observación directa y materiales de otros medios. Cuando se utiliza material de otra publicación y la fuente está disponible, procuramos identificarla y conservar el enlace o crédito correspondiente.",
      "Las afirmaciones que no han sido confirmadas de forma independiente deben presentarse con el contexto y las reservas adecuados. Los señalamientos sobre personas o instituciones deben atribuirse a quien los realizó y no presentarse como hechos probados sin evidencia.",
    ],
  },
  {
    title: "Correcciones y actualizaciones",
    paragraphs: [
      "Si detectas un dato incorrecto, una atribución incompleta o un contexto que deba añadirse, escríbenos con el enlace del artículo y la información que respalde el cambio.",
      "Revisaremos las solicitudes y, cuando una corrección cambie de manera sustancial la información publicada, actualizaremos el artículo y señalaremos la corrección o actualización para que el lector pueda reconocerla.",
    ],
  },
  {
    title: "Independencia y contenido comercial",
    paragraphs: [
      "La información editorial y el contenido comercial deben distinguirse claramente. La contratación de publicidad no debe presentarse como cobertura periodística independiente.",
    ],
  },
  {
    title: "Herramientas de inteligencia artificial",
    paragraphs: [
      "Las herramientas automatizadas pueden apoyar tareas de producción y accesibilidad. La redacción debe revisar la información factual antes de publicarla; una respuesta generada por un sistema de inteligencia artificial no constituye por sí sola una fuente periodística.",
    ],
  },
];

export default function EditorialPolicyPage() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-14 md:py-20">
      <article className="mx-auto max-w-3xl rounded-2xl border border-zinc-200 bg-white px-6 py-10 shadow-sm md:px-12 md:py-14">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-red-700">
          {siteConfig.name}
        </p>
        <h1 className="font-serif text-4xl font-bold leading-tight text-slate-950 md:text-5xl">
          Política editorial y correcciones
        </h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Estos principios explican cómo tratamos las fuentes, las correcciones,
          la independencia editorial y las herramientas automatizadas.
        </p>

        <div className="mt-10 space-y-9">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-3 font-serif text-2xl font-bold text-slate-900">
                {section.title}
              </h2>
              <div className="space-y-3 text-base leading-8 text-slate-700">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-10 border-t border-zinc-200 pt-7 leading-7 text-slate-700">
          Para reportar un error o enviar información, contacta a la redacción en{" "}
          <a
            className="font-semibold text-blue-800 underline"
            href={`mailto:${siteConfig.contact.email}`}
          >
            {siteConfig.contact.email}
          </a>
          {" "}o visita la página de <Link className="font-semibold text-blue-800 underline" href="/contacto">contacto</Link>.
        </p>
      </article>
    </main>
  );
}
