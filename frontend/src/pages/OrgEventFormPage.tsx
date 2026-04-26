import { FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { TopNavbar } from "../components/layout/TopNavbar";
import { toAbsoluteImageUrl } from "../utils/image";

interface EventPackageInput {
  id?: string;
  title: string;
  cost: string;
  details: string;
}

interface EventDetailResponse {
  id: string;
  title: string;
  details: string;
  date: string;
  country: string;
  city: string;
  venue: string;
  status: string;
  expectedParticipants: number;
  targetSponsorValue: number;
  imagePath?: string | null;
  packages?: {
    id: string;
    title: string;
    cost: number;
    details: string;
  }[];
}

interface OrgEventSummary {
  id: string;
}

const API = "http://localhost:3000";

export const OrgEventFormPage = () => {
  const { id: eventID } = useParams<{ id: string }>();
  const isEditMode = Boolean(eventID);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [title, setTitle] = useState("");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [venue, setVenue] = useState("");
  const [expectedParticipants, setExpectedParticipants] = useState("");
  const [targetSponsorValue, setTargetSponsorValue] = useState("");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState("pending");
  const [imagePath, setImagePath] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [packages, setPackages] = useState<EventPackageInput[]>([
    { title: "", cost: "", details: "" },
  ]);

  const pageTitle = isEditMode ? "Edit Event" : "Create New Event";
  const submitLabel = isEditMode ? "Save Changes" : "Create Event";

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setErrorMessage("");

      try {
        const meRes = await fetch(`${API}/auth/me`, { credentials: "include" });
        const meData = await meRes.json();
        const role = meData?.user?.role;
        const isOrgRole = role === "org" || role === "organization";

        if (!meData?.user || !isOrgRole) {
          navigate("/login", { replace: true });
          return;
        }

        if (!isEditMode || !eventID) {
          setLoading(false);
          return;
        }

        const ownEventsRes = await fetch(`${API}/org/${meData.user.id}/events`, {
          credentials: "include",
        });
        const ownEventsData = await ownEventsRes.json();
        const ownsEvent = (ownEventsData?.data || []).some(
          (event: OrgEventSummary) => event.id === eventID
        );

        if (!ownsEvent) {
          navigate("/org/events", { replace: true });
          return;
        }

        const eventRes = await fetch(`${API}/org/events/${eventID}`, {
          credentials: "include",
        });
        const eventData = await eventRes.json();
        const event: EventDetailResponse | undefined = eventData?.data;

        if (!event) {
          setErrorMessage("Unable to load this event.");
          setLoading(false);
          return;
        }

        const parsedDate = new Date(event.date);
        const localDate = Number.isNaN(parsedDate.getTime())
          ? ""
          : parsedDate.toISOString().slice(0, 10);
        const localTime = Number.isNaN(parsedDate.getTime())
          ? ""
          : `${String(parsedDate.getHours()).padStart(2, "0")}:${String(
              parsedDate.getMinutes()
            ).padStart(2, "0")}`;

        setTitle(event.title || "");
        setDateInput(localDate);
        setTimeInput(localTime);
        setCountry(event.country || "");
        setCity(event.city || "");
        setVenue(event.venue || "");
        setExpectedParticipants(String(event.expectedParticipants || ""));
        setTargetSponsorValue(String(event.targetSponsorValue || ""));
        setDetails(event.details || "");
        setStatus(event.status || "pending");
        setImagePath(event.imagePath || null);
        setPackages(
          event.packages && event.packages.length > 0
            ? event.packages.map((pkg) => ({
                id: pkg.id,
                title: pkg.title,
                cost: String(pkg.cost),
                details: pkg.details,
              }))
            : [{ title: "", cost: "", details: "" }]
        );
      } catch {
        setErrorMessage("Failed to initialize event form.");
      } finally {
        setLoading(false);
      }
    };

    void init();
  }, [eventID, isEditMode, navigate]);

  const packageSummary = useMemo(() => {
    return packages.reduce((acc, pkg) => {
      const cost = Number(pkg.cost);
      return Number.isFinite(cost) ? acc + Math.max(0, cost) : acc;
    }, 0);
  }, [packages]);

  const updatePackage = (index: number, key: keyof EventPackageInput, value: string) => {
    setPackages((prev) =>
      prev.map((pkg, i) => (i === index ? { ...pkg, [key]: value } : pkg))
    );
  };

  const addPackage = () => {
    setPackages((prev) => [...prev, { title: "", cost: "", details: "" }]);
  };

  const removePackage = (index: number) => {
    setPackages((prev) => {
      if (prev.length === 1) {
        return [{ title: "", cost: "", details: "" }];
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim() || !details.trim() || !country.trim() || !city.trim() || !venue.trim() || !dateInput) {
      setErrorMessage("Please fill in title, date, location, venue, and details.");
      return;
    }

    const participants = Number(expectedParticipants);
    if (!Number.isFinite(participants) || participants < 1) {
      setErrorMessage("Expected participants must be a positive number.");
      return;
    }

    const sponsorTarget = Number(targetSponsorValue);
    if (!Number.isFinite(sponsorTarget) || sponsorTarget < 1) {
      setErrorMessage("Target sponsor value must be a positive number.");
      return;
    }

    const dateISO = new Date(`${dateInput}T${timeInput || "00:00"}:00`).toISOString();

    const normalizedPackages = packages
      .map((pkg) => ({
        id: pkg.id,
        title: pkg.title.trim(),
        details: pkg.details.trim(),
        cost: Number(pkg.cost),
      }))
      .filter(
        (pkg) =>
          pkg.title.length > 0 &&
          pkg.details.length > 0 &&
          Number.isFinite(pkg.cost) &&
          pkg.cost >= 0
      );

    setSaving(true);
    try {
      const endpoint = isEditMode && eventID ? `${API}/org/events/${eventID}` : `${API}/org/events`;
      const method = isEditMode ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          date: dateISO,
          details: details.trim(),
          country: country.trim(),
          city: city.trim(),
          venue: venue.trim(),
          expectedParticipants: participants,
          targetSponsorValue: sponsorTarget,
          ...(isEditMode ? { status } : {}),
          packages: normalizedPackages,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || data?.error || "Failed to save event");
      }

      const targetEventID = isEditMode ? eventID : data?.data?.id;

      if (targetEventID && imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        const imageRes = await fetch(`${API}/org/events/${targetEventID}/image`, {
          method: "POST",
          credentials: "include",
          body: formData,
        });
        const imageData = await imageRes.json();
        if (!imageRes.ok || !imageData?.success) {
          throw new Error(imageData?.error || "Event saved, but image upload failed");
        }
      }

      navigate(targetEventID ? `/org/events/${targetEventID}` : "/org/events");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save event.";
      setErrorMessage(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImageByPath = async () => {
    if (!isEditMode || !eventID || !imageFile) return;
    setUploadingImage(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("image", imageFile);

      const res = await fetch(`${API}/org/events/${eventID}/image`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Failed to upload event image");
      }

      setImagePath(data?.data?.imagePath || null);
      setImageFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to upload image.";
      setErrorMessage(message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
        <Sidebar variant="org-dashboard" ctaPosition="top" />
        <main className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-3 border-blue-200 border-t-blue-600" />
            <p className="text-sm text-gray-400">Loading event form...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-roboto">
      <Sidebar variant="org-dashboard" ctaPosition="top" />

      <main className="flex-1 overflow-y-auto">
        <TopNavbar />
        <div className="mx-auto max-w-5xl px-8 py-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <Link
                to="/org/events"
                className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-gray-500 transition-colors hover:text-gray-700"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to Events
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
              <p className="mt-1 text-gray-500">
                Configure your event details and sponsorship packages for the matching system.
              </p>
            </div>
            <button
              type="submit"
              form="event-form"
              disabled={saving}
              className="shrink-0 rounded-xl bg-[#1a2e4a] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#243b5e] disabled:opacity-60"
            >
              {saving ? "Saving..." : submitLabel}
            </button>
          </div>

          {errorMessage && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form id="event-form" onSubmit={onSubmit} className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Event Cover Image</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[180px_minmax(0,1fr)] md:items-start">
                <div className="h-28 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                  {toAbsoluteImageUrl(imagePath) ? (
                    <img
                      src={toAbsoluteImageUrl(imagePath) || ""}
                      alt="Event cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-gray-400">
                      No image selected
                    </div>
                  )}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Select Image</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                    {isEditMode && (
                      <button
                        type="button"
                        onClick={handleUploadImageByPath}
                        disabled={uploadingImage || !imageFile}
                        className="shrink-0 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
                      >
                        {uploadingImage ? "Uploading..." : "Upload"}
                      </button>
                    )}
                  </div>
                  {imageFile && (
                    <p className="mt-2 text-xs text-gray-500">Selected: {imageFile.name}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {isEditMode
                      ? "The server auto-generates a filename from event id + UUID."
                      : "The selected image uploads automatically after the event is created."}
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Core Information</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Event Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Annual Fall Career & Tech Expo"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Date</label>
                  <input
                    type="date"
                    value={dateInput}
                    onChange={(e) => setDateInput(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Start Time</label>
                  <input
                    type="time"
                    value={timeInput}
                    onChange={(e) => setTimeInput(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Boston"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="Indonesia"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Venue</label>
                  <input
                    type="text"
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                    placeholder="Main Campus Convention Hall"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Expected Participants</label>
                  <input
                    type="number"
                    min={1}
                    value={expectedParticipants}
                    onChange={(e) => setExpectedParticipants(e.target.value)}
                    placeholder="300"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-700">Target Sponsor Value</label>
                  <input
                    type="number"
                    min={1}
                    value={targetSponsorValue}
                    onChange={(e) => setTargetSponsorValue(e.target.value)}
                    placeholder="65000"
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {isEditMode && (
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-700">Status</label>
                    <div className="relative">
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-all focus:border-blue-200 focus:ring-2 focus:ring-blue-50 focus-visible:outline-none"
                      >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Event Description</h2>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={8}
                placeholder="Describe your event goals, audience, and sponsorship value."
                className="w-full resize-y rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm leading-relaxed text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Sponsorship Packages</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Estimated total package value: ${packageSummary.toLocaleString()}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addPackage}
                  className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
                >
                  + Add Tier
                </button>
              </div>

              <div className="space-y-4">
                {packages.map((pkg, index) => (
                  <div key={pkg.id || `new-${index}`} className="rounded-xl border border-gray-100 bg-slate-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-sm font-bold text-gray-700">Tier {index + 1}</h3>
                      <button
                        type="button"
                        onClick={() => removePackage(index)}
                        className="text-sm font-semibold text-red-500 transition-colors hover:text-red-600"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Package Title
                        </label>
                        <input
                          type="text"
                          value={pkg.title}
                          onChange={(e) => updatePackage(index, "title", e.target.value)}
                          placeholder="Gold Sponsorship"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Cost
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={pkg.cost}
                          onChange={(e) => updatePackage(index, "cost", e.target.value)}
                          placeholder="5000"
                          className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                          Included Benefits
                        </label>
                        <textarea
                          rows={3}
                          value={pkg.details}
                          onChange={(e) => updatePackage(index, "details", e.target.value)}
                          placeholder="Logo placement, speaking slot, booth access..."
                          className="w-full resize-y rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition-all focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex items-center justify-between">
              <Link
                to="/org/events"
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-[#1a2e4a] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#243b5e] disabled:opacity-60"
              >
                {saving ? "Saving..." : submitLabel}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
