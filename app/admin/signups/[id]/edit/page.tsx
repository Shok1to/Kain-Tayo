import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin-guard";
import { getSignup } from "@/lib/admin/signups";
import { formatPhone } from "@/lib/admin/format";
import { BUSINESS_TYPES, PROVINCES } from "@/lib/validation/signup";
import AdminHeader from "@/components/admin/AdminHeader";
import EditForm, { type FieldConfig } from "@/components/admin/EditForm";
import { errorClass, linkClass } from "@/components/admin/styles";
import { updateApplicant, updateBusiness } from "../../actions";

const addressFields: FieldConfig[] = [
  { name: "streetNumber", label: "Address" },
  { name: "streetName", label: "Address line 2" },
  { name: "city", label: "City" },
  { name: "province", label: "Province or territory", options: PROVINCES },
  { name: "postalCode", label: "Postal code" },
  { name: "country", label: "Country", required: true },
];

const personalFields: FieldConfig[] = [
  { name: "firstName", label: "First name", required: true },
  { name: "lastName", label: "Last name", required: true },
  ...addressFields,
  { name: "phone", label: "Phone", type: "tel" },
  { name: "mobile", label: "Mobile", type: "tel", required: true },
  { name: "email", label: "Email", type: "email", required: true },
];

const businessFields: FieldConfig[] = [
  { name: "companyName", label: "Company name", required: true },
  { name: "businessType", label: "Type of business", required: true, options: BUSINESS_TYPES },
  ...addressFields,
  { name: "phone", label: "Phone", type: "tel" },
  { name: "website", label: "Website", type: "url" },
  { name: "email", label: "Email", type: "email" },
];

const sectionClass = "rounded-3xl border-2 border-ink bg-white p-5";

export default function EditSignupPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <div className="mx-auto max-w-4xl">
      <Suspense fallback={<p>Loading...</p>}>
        <Edit params={params} />
      </Suspense>
    </div>
  );
}

async function Edit({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const result = await getSignup(id);
  if (result.ok && !result.signup) notFound();

  return (
    <div className="space-y-6">
      <AdminHeader email={admin.email} />
      <Link href={`/admin/signups/${id}`} className={linkClass}>
        Back to this signup without saving
      </Link>
      <h1 className="text-3xl font-bold">Edit signup</h1>
      <p>
        Change only what the person asked you to correct. Each section is saved on its own.
      </p>

      {result.ok && result.signup ? (
        <>
          <section className={sectionClass}>
            <EditForm
              formId="personal"
              title="Personal information"
              action={updateApplicant}
              hidden={{ id }}
              fields={personalFields}
              initial={{
                firstName: result.signup.first_name,
                lastName: result.signup.last_name,
                streetNumber: result.signup.street_number ?? "",
                streetName: result.signup.street_name ?? "",
                city: result.signup.city ?? "",
                province: result.signup.province ?? "",
                postalCode: result.signup.postal_code ?? "",
                country: result.signup.country,
                phone: formatPhone(result.signup.phone),
                mobile: formatPhone(result.signup.mobile),
                email: result.signup.email,
              }}
            />
          </section>

          {result.signup.businesses.map((b, index, all) => (
            <section key={b.id} className={sectionClass}>
              <EditForm
                formId={`business-${b.id}`}
                title={`Business information${all.length > 1 ? ` (${index + 1} of ${all.length})` : ""}`}
                action={updateBusiness}
                hidden={{ id, businessId: b.id }}
                fields={businessFields}
                initial={{
                  companyName: b.company_name,
                  businessType: b.business_type,
                  streetNumber: b.street_number ?? "",
                  streetName: b.street_name ?? "",
                  city: b.city ?? "",
                  province: b.province ?? "",
                  postalCode: b.postal_code ?? "",
                  country: b.country,
                  phone: formatPhone(b.phone),
                  website: b.website ?? "",
                  email: b.email ?? "",
                }}
              />
            </section>
          ))}
        </>
      ) : (
        <p role="alert" className={errorClass}>
          We could not load this signup. Please reload the page in a moment.
        </p>
      )}
    </div>
  );
}
