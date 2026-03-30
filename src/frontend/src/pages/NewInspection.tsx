import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Camera,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Minus,
  Search,
  Upload,
  X as XIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { AppPage } from "../App";
import {
  CheckItemStatus,
  type Inspection,
  InspectionCategory,
  type InspectionChecklistItem,
  InspectionStatus,
  PhotoCategory,
  type PhotoReference,
  type Vehicle,
} from "../backend";
import { ExternalBlob } from "../backend";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAddInspection, useAddOrUpdateVehicle } from "../hooks/useQueries";

interface NewInspectionProps {
  navigate: (page: AppPage) => void;
}

type ToggleStatus = CheckItemStatus;

interface ChecklistItemState {
  item: string;
  category: InspectionCategory;
  status: ToggleStatus;
  notes: string;
}

const CHECKLIST_ITEMS: Omit<ChecklistItemState, "status" | "notes">[] = [
  { item: "Engine Oil Level", category: InspectionCategory.engine },
  { item: "Air Filter", category: InspectionCategory.engine },
  { item: "Coolant Level", category: InspectionCategory.engine },
  { item: "Battery Condition", category: InspectionCategory.engine },
  { item: "Front Brakes", category: InspectionCategory.brakes },
  { item: "Rear Brakes", category: InspectionCategory.brakes },
  { item: "Brake Fluid", category: InspectionCategory.brakes },
  { item: "Front Left Tire", category: InspectionCategory.tires },
  { item: "Front Right Tire", category: InspectionCategory.tires },
  { item: "Rear Left Tire", category: InspectionCategory.tires },
  { item: "Rear Right Tire", category: InspectionCategory.tires },
  { item: "Headlights", category: InspectionCategory.lights },
  { item: "Tail Lights", category: InspectionCategory.lights },
  { item: "Turn Signals", category: InspectionCategory.lights },
  { item: "Body Panels", category: InspectionCategory.body },
  { item: "Windshield", category: InspectionCategory.body },
  { item: "Interior Trim", category: InspectionCategory.interior },
  { item: "Seat Belts", category: InspectionCategory.interior },
  { item: "Power Windows", category: InspectionCategory.interior },
  { item: "Engine Oil", category: InspectionCategory.fluid },
  { item: "Transmission Fluid", category: InspectionCategory.fluid },
  { item: "Power Steering Fluid", category: InspectionCategory.fluid },
];

const CATEGORY_LABELS: Record<InspectionCategory, string> = {
  [InspectionCategory.engine]: "Engine",
  [InspectionCategory.brakes]: "Brakes",
  [InspectionCategory.tires]: "Tires",
  [InspectionCategory.lights]: "Lights",
  [InspectionCategory.body]: "Body",
  [InspectionCategory.interior]: "Interior",
  [InspectionCategory.fluid]: "Fluids",
};

const PHOTO_TILES: { key: PhotoCategory; label: string }[] = [
  { key: PhotoCategory.front, label: "Front" },
  { key: PhotoCategory.rear, label: "Rear" },
  { key: PhotoCategory.side, label: "Side" },
  { key: PhotoCategory.damage, label: "Damage" },
];

const STEPS = [
  { num: 1, label: "Vehicle Details", icon: Car },
  { num: 2, label: "Checklist", icon: ClipboardCheck },
  { num: 3, label: "Photos", icon: Camera },
  { num: 4, label: "Notes & Submit", icon: FileText },
];

export default function NewInspection({ navigate }: NewInspectionProps) {
  const { identity } = useInternetIdentity();
  const [step, setStep] = useState(1);

  const [vin, setVin] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [color, setColor] = useState("");
  const [odometer, setOdometer] = useState("");
  const [vinLooking, setVinLooking] = useState(false);

  const [checklist, setChecklist] = useState<ChecklistItemState[]>(
    CHECKLIST_ITEMS.map((item) => ({
      ...item,
      status: CheckItemStatus.na,
      notes: "",
    })),
  );

  const [photos, setPhotos] = useState<
    Partial<
      Record<
        PhotoCategory,
        { file: File; preview: string; uploading: boolean; blob?: ExternalBlob }
      >
    >
  >({});
  const fileInputRefs = useRef<
    Partial<Record<PhotoCategory, HTMLInputElement | null>>
  >({});

  const [damageNotes, setDamageNotes] = useState("");
  const [overallNotes, setOverallNotes] = useState("");

  const { mutateAsync: addInspection, isPending: submitting } =
    useAddInspection();
  const { mutateAsync: addOrUpdateVehicle } = useAddOrUpdateVehicle();

  const handleVinLookup = async () => {
    if (!vin.trim()) {
      toast.error("Enter a VIN first");
      return;
    }
    setVinLooking(true);
    await new Promise((r) => setTimeout(r, 800));
    setVinLooking(false);
    toast.success("VIN lookup complete (manual entry required)");
  };

  const toggleChecklistStatus = (index: number, status: ToggleStatus) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status } : item)),
    );
  };

  const setChecklistNote = (index: number, notes: string) => {
    setChecklist((prev) =>
      prev.map((item, i) => (i === index ? { ...item, notes } : item)),
    );
  };

  const handlePhotoSelect = async (category: PhotoCategory, file: File) => {
    const preview = URL.createObjectURL(file);
    setPhotos((prev) => ({
      ...prev,
      [category]: { file, preview, uploading: true },
    }));
    try {
      const arrayBuffer = await file.arrayBuffer();
      const blob = ExternalBlob.fromBytes(
        new Uint8Array(arrayBuffer),
      ).withUploadProgress((pct) => {
        console.log(`${category} upload: ${pct}%`);
      });
      setPhotos((prev) => ({
        ...prev,
        [category]: { file, preview, uploading: false, blob },
      }));
    } catch {
      toast.error(`Failed to process ${category} photo`);
      setPhotos((prev) => {
        const n = { ...prev };
        delete n[category];
        return n;
      });
    }
  };

  const handleSubmit = async () => {
    if (!identity) {
      toast.error("Not authenticated");
      return;
    }
    if (!vin.trim() || !make.trim() || !model.trim()) {
      toast.error("Vehicle details are incomplete");
      return;
    }
    try {
      const vehicle: Vehicle = {
        vin: vin.trim(),
        make: make.trim(),
        model: model.trim(),
        year: Number.parseInt(year) || new Date().getFullYear(),
        licensePlate: licensePlate.trim(),
        color: color.trim(),
        odometer: Number.parseInt(odometer) || 0,
        owner: identity.getPrincipal(),
      };
      await addOrUpdateVehicle(vehicle);

      const photoRefs: PhotoReference[] = Object.entries(photos)
        .filter(([, v]) => v?.blob)
        .map(([category, v]) => ({
          blob: v!.blob!,
          caption: category,
          category: category as PhotoCategory,
        }));

      const checklistItems: InspectionChecklistItem[] = checklist.map((c) => ({
        item: c.item,
        category: c.category,
        status: c.status,
        notes: c.notes,
      }));

      const failCount = checklist.filter(
        (c) => c.status === CheckItemStatus.fail,
      ).length;

      const inspection: Inspection = {
        inspectionId: `insp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        vehicleId: vin.trim(),
        date: BigInt(Date.now() * 1_000_000),
        status: InspectionStatus.completed,
        inspector: identity.getPrincipal(),
        checklistItems,
        photos: photoRefs,
        notes: `${overallNotes}\n${damageNotes}`.trim(),
        overallStatus:
          failCount > 0 ? CheckItemStatus.fail : CheckItemStatus.pass,
      };

      await addInspection(inspection);
      toast.success("Inspection submitted successfully!");
      navigate({ name: "dashboard" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit inspection");
    }
  };

  const canProceedStep1 =
    vin.trim() && make.trim() && model.trim() && year.trim();

  const groupedChecklist = Object.values(InspectionCategory)
    .map((cat) => ({
      category: cat,
      items: checklist
        .map((item, idx) => ({ ...item, idx }))
        .filter((item) => item.category === cat),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1
          className="text-2xl font-bold"
          style={{ color: "oklch(var(--navy))" }}
        >
          New Vehicle Inspection
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Complete all steps to generate a comprehensive inspection report.
        </p>
      </div>

      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.num} className="flex items-center flex-1">
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
                step === s.num
                  ? "text-white"
                  : step > s.num
                    ? "text-white"
                    : "text-muted-foreground bg-muted"
              }`}
              style={
                step === s.num
                  ? { background: "oklch(var(--teal))" }
                  : step > s.num
                    ? { background: "oklch(var(--navy))" }
                    : {}
              }
            >
              <s.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{s.label}</span>
              <span className="sm:hidden">{s.num}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-1"
                style={{
                  background:
                    step > s.num
                      ? "oklch(var(--navy))"
                      : "oklch(var(--border))",
                }}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Car
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--teal))" }}
                  />
                  Vehicle Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="vin">VIN *</Label>
                    <Input
                      id="vin"
                      data-ocid="vehicle.vin.input"
                      value={vin}
                      onChange={(e) => setVin(e.target.value.toUpperCase())}
                      placeholder="e.g. 1HGBH41JXMN109186"
                      maxLength={17}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      data-ocid="vehicle.vin_lookup.button"
                      variant="outline"
                      onClick={handleVinLookup}
                      disabled={vinLooking}
                      className="h-10"
                    >
                      {vinLooking ? (
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                      ) : (
                        <Search className="w-4 h-4 mr-2" />
                      )}
                      VIN Lookup
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="make">Make *</Label>
                    <Input
                      id="make"
                      data-ocid="vehicle.make.input"
                      value={make}
                      onChange={(e) => setMake(e.target.value)}
                      placeholder="e.g. Toyota"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="model">Model *</Label>
                    <Input
                      id="model"
                      data-ocid="vehicle.model.input"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder="e.g. Camry"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="year">Year *</Label>
                    <Input
                      id="year"
                      data-ocid="vehicle.year.input"
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="e.g. 2023"
                      min="1900"
                      max="2030"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="license">License Plate</Label>
                    <Input
                      id="license"
                      data-ocid="vehicle.license_plate.input"
                      value={licensePlate}
                      onChange={(e) =>
                        setLicensePlate(e.target.value.toUpperCase())
                      }
                      placeholder="e.g. DL-01-AB-1234"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color">Color</Label>
                    <Input
                      id="color"
                      data-ocid="vehicle.color.input"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="e.g. Silver"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="odometer">Odometer (km)</Label>
                    <Input
                      id="odometer"
                      data-ocid="vehicle.odometer.input"
                      type="number"
                      value={odometer}
                      onChange={(e) => setOdometer(e.target.value)}
                      placeholder="e.g. 45000"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {groupedChecklist.map(({ category, items }) => (
              <Card key={category} className="shadow-card">
                <CardHeader className="pb-3">
                  <CardTitle
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: "oklch(var(--teal))" }}
                  >
                    {CATEGORY_LABELS[category]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {items.map(({ idx, item, status, notes }) => (
                    <div key={item} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-medium flex-1">
                          {item}
                        </span>
                        <div className="flex items-center gap-1">
                          {(
                            [
                              CheckItemStatus.pass,
                              CheckItemStatus.fail,
                              CheckItemStatus.na,
                            ] as const
                          ).map((s) => (
                            <button
                              type="button"
                              key={s}
                              data-ocid={`checklist.${item.toLowerCase().replace(/ /g, "_")}.toggle`}
                              onClick={() => toggleChecklistStatus(idx, s)}
                              className={`h-7 px-2.5 rounded text-xs font-semibold border transition-all ${
                                status === s
                                  ? "text-white"
                                  : "bg-muted border-border text-muted-foreground hover:border-primary"
                              }`}
                              style={
                                status === s
                                  ? {
                                      background:
                                        s === CheckItemStatus.pass
                                          ? "oklch(var(--status-completed))"
                                          : s === CheckItemStatus.fail
                                            ? "oklch(var(--destructive))"
                                            : "oklch(var(--muted-foreground))",
                                      borderColor: "transparent",
                                    }
                                  : {}
                              }
                            >
                              {s === CheckItemStatus.pass ? (
                                <Check className="w-3 h-3" />
                              ) : s === CheckItemStatus.fail ? (
                                <XIcon className="w-3 h-3" />
                              ) : (
                                <Minus className="w-3 h-3" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      {status === CheckItemStatus.fail && (
                        <Input
                          data-ocid={`checklist.${item.toLowerCase().replace(/ /g, "_")}.input`}
                          value={notes}
                          onChange={(e) =>
                            setChecklistNote(idx, e.target.value)
                          }
                          placeholder="Describe the issue..."
                          className="text-sm h-8"
                        />
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--teal))" }}
                  />
                  Inspection Photos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {PHOTO_TILES.map(({ key, label }) => {
                    const photo = photos[key];
                    return (
                      <button
                        type="button"
                        key={key}
                        aria-label={`Upload ${label} photo`}
                        data-ocid={`photos.${key}.upload_button`}
                        className="relative aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors overflow-hidden w-full"
                        style={{
                          borderColor: photo ? "oklch(var(--teal))" : undefined,
                        }}
                        onClick={() => fileInputRefs.current[key]?.click()}
                      >
                        {photo ? (
                          <>
                            <img
                              src={photo.preview}
                              alt={label}
                              className="absolute inset-0 w-full h-full object-cover"
                            />
                            {photo.uploading && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                            <div className="absolute top-2 right-2">
                              <Badge
                                className="text-white text-xs"
                                style={{ background: "oklch(var(--teal))" }}
                              >
                                {label}
                              </Badge>
                            </div>
                          </>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                            <span className="text-sm font-medium text-muted-foreground">
                              {label}
                            </span>
                            <span className="text-xs text-muted-foreground/70 mt-0.5">
                              Click to upload
                            </span>
                          </>
                        )}
                        <input
                          ref={(el) => {
                            fileInputRefs.current[key] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoSelect(key, file);
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText
                    className="w-5 h-5"
                    style={{ color: "oklch(var(--teal))" }}
                  />
                  Inspection Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="damage-notes">Damage Notes</Label>
                  <Textarea
                    id="damage-notes"
                    data-ocid="notes.damage.textarea"
                    value={damageNotes}
                    onChange={(e) => setDamageNotes(e.target.value)}
                    placeholder="Describe any damage observed during inspection..."
                    rows={4}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overall-notes">
                    Overall Notes & Recommendations
                  </Label>
                  <Textarea
                    id="overall-notes"
                    data-ocid="notes.overall.textarea"
                    value={overallNotes}
                    onChange={(e) => setOverallNotes(e.target.value)}
                    placeholder="Overall inspection notes, recommendations, next service due..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            <Card
              className="shadow-card"
              style={{ background: "oklch(var(--navy) / 0.03)" }}
            >
              <CardContent className="pt-4 pb-4">
                <h3
                  className="font-semibold text-sm mb-3"
                  style={{ color: "oklch(var(--navy))" }}
                >
                  Inspection Summary
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white rounded-lg p-3 shadow-xs">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "oklch(var(--status-completed))" }}
                    >
                      {
                        checklist.filter(
                          (c) => c.status === CheckItemStatus.pass,
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Pass</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-xs">
                    <div
                      className="text-lg font-bold"
                      style={{ color: "oklch(var(--destructive))" }}
                    >
                      {
                        checklist.filter(
                          (c) => c.status === CheckItemStatus.fail,
                        ).length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">Fail</div>
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-xs">
                    <div className="text-lg font-bold text-muted-foreground">
                      {
                        checklist.filter((c) => c.status === CheckItemStatus.na)
                          .length
                      }
                    </div>
                    <div className="text-xs text-muted-foreground">N/A</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between mt-6">
        <Button
          data-ocid="inspection.back.button"
          variant="outline"
          onClick={() =>
            step > 1 ? setStep(step - 1) : navigate({ name: "dashboard" })
          }
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {step === 1 ? "Cancel" : "Back"}
        </Button>

        {step < 4 ? (
          <Button
            data-ocid="inspection.next.button"
            onClick={() => setStep(step + 1)}
            disabled={step === 1 && !canProceedStep1}
            style={{ background: "oklch(var(--navy))" }}
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            data-ocid="inspection.submit.primary_button"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ background: "oklch(var(--teal))" }}
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              <>
                Submit Inspection <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
