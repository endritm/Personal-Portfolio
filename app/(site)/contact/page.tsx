import type { Metadata } from "next";
import { Availability } from "@/components/site/Availability";
import { ContactForm } from "@/components/site/ContactForm";
import { CopyEmail } from "@/components/site/CopyEmail";
import { getSettings } from "@/lib/content";
import s from "@/components/site/contact.module.css";

export const metadata: Metadata = {
  title: "Contact",
  description: "Start a project with Endrit.",
};

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <div className={`wrap from-light ${s.page}`}>
      <div className={s.lead}>
        <p className="eyebrow">Contact</p>
        <h1 className={s.title}>Start a project</h1>
        {settings.contactIntro && <p className={s.intro}>{settings.contactIntro}</p>}
        <CopyEmail email={settings.email} className={s.email} />
        <Availability availability={settings.availability} />
      </div>
      <ContactForm email={settings.email} />
    </div>
  );
}
