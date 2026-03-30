import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  Car,
  ChevronRight,
  ClipboardCheck,
  Edit,
  Eye,
  Plus,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { AppPage } from "../App";
import { InspectionStatus } from "../backend";
import { useGetAllInspections, useListVehicles } from "../hooks/useQueries";

interface DashboardProps {
  navigate: (page: AppPage) => void;
}

const SKEL_COLS = [
  "date",
  "vehicle",
  "plate",
  "inspector",
  "status",
  "actions",
];

function StatusBadge({ status }: { status: InspectionStatus }) {
  if (status === InspectionStatus.completed) {
    return (
      <Badge
        className="text-white text-xs"
        style={{ background: "oklch(var(--status-completed))" }}
      >
        Completed
      </Badge>
    );
  }
  if (status === InspectionStatus.inProgress) {
    return (
      <Badge
        className="text-white text-xs"
        style={{ background: "oklch(var(--status-inprogress))" }}
      >
        In Progress
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-xs">
      Draft
    </Badge>
  );
}

function formatDate(time: bigint): string {
  return new Date(Number(time) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const SAMPLE_INSPECTIONS = [
  {
    inspectionId: "sample-1",
    vehicleId: "VIN001",
    date: BigInt(Date.now() * 1_000_000),
    status: InspectionStatus.completed,
    inspector: "Raj Kumar",
    vehicle: {
      make: "Toyota",
      model: "Camry",
      year: 2021,
      licensePlate: "DL-01-AB-1234",
    },
  },
  {
    inspectionId: "sample-2",
    vehicleId: "VIN002",
    date: BigInt((Date.now() - 86400000) * 1_000_000),
    status: InspectionStatus.inProgress,
    inspector: "Priya Sharma",
    vehicle: {
      make: "Honda",
      model: "City",
      year: 2022,
      licensePlate: "MH-12-CD-5678",
    },
  },
  {
    inspectionId: "sample-3",
    vehicleId: "VIN003",
    date: BigInt((Date.now() - 172800000) * 1_000_000),
    status: InspectionStatus.draft,
    inspector: "Amit Singh",
    vehicle: {
      make: "Maruti",
      model: "Swift",
      year: 2020,
      licensePlate: "UP-32-EF-9012",
    },
  },
  {
    inspectionId: "sample-4",
    vehicleId: "VIN004",
    date: BigInt((Date.now() - 259200000) * 1_000_000),
    status: InspectionStatus.completed,
    inspector: "Sunita Verma",
    vehicle: {
      make: "Hyundai",
      model: "i20",
      year: 2023,
      licensePlate: "KA-01-GH-3456",
    },
  },
];

const STEPS = [
  {
    step: "01",
    title: "Vehicle Details",
    desc: "Enter VIN, make, model, year, and odometer reading to identify the vehicle.",
    icon: Car,
  },
  {
    step: "02",
    title: "Inspection Checklist",
    desc: "Systematically check Engine, Brakes, Tires, Lights, Body, Interior, and Fluids.",
    icon: ClipboardCheck,
  },
  {
    step: "03",
    title: "Photos & Report",
    desc: "Upload inspection photos and generate a comprehensive digital report instantly.",
    icon: TrendingUp,
  },
];

const FEATURES = [
  { title: "VIN Lookup", desc: "Auto-populate vehicle details from VIN" },
  {
    title: "Digital Checklists",
    desc: "Categorized Pass/Fail/N/A checklist items",
  },
  {
    title: "Photo Upload",
    desc: "Attach photos for front, rear, side, and damage",
  },
  { title: "Status Tracking", desc: "Track Draft → In Progress → Completed" },
  { title: "Inspection History", desc: "Full history per vehicle over time" },
  { title: "Role-Based Access", desc: "Admin and inspector role management" },
];

export default function Dashboard({ navigate }: DashboardProps) {
  const { data: inspections, isLoading: inspLoading } = useGetAllInspections();
  const { data: vehicles } = useListVehicles();

  const vehicleMap = new Map((vehicles ?? []).map((v) => [v.vin, v]));
  const completed = (inspections ?? []).filter(
    (i) => i.status === InspectionStatus.completed,
  ).length;
  const inProgress = (inspections ?? []).filter(
    (i) => i.status === InspectionStatus.inProgress,
  ).length;
  const total = (inspections ?? []).length;

  const stats = [
    {
      label: "Total Inspections",
      value: total,
      icon: ClipboardCheck,
      color: "oklch(var(--teal))",
    },
    {
      label: "Completed",
      value: completed,
      icon: TrendingUp,
      color: "oklch(var(--status-completed))",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: AlertCircle,
      color: "oklch(var(--status-inprogress))",
    },
    {
      label: "Vehicles Tracked",
      value: vehicles?.length ?? 0,
      icon: Car,
      color: "oklch(var(--navy))",
    },
  ];

  const displayInspections =
    total > 0 ? (inspections ?? []).slice(0, 10) : null;

  return (
    <div>
      <section
        style={{ background: "oklch(var(--navy))" }}
        className="py-16 px-4"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium mb-5"
                style={{
                  background: "oklch(var(--teal) / 0.2)",
                  color: "oklch(var(--teal))",
                }}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                Professional Inspection Platform
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Complete Vehicle
                <br />
                <span style={{ color: "oklch(var(--teal))" }}>
                  Inspection Reports
                </span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-md">
                Streamline your vehicle inspections with digital checklists,
                photo documentation, and instant report generation.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  data-ocid="hero.new_inspection.primary_button"
                  onClick={() => navigate({ name: "new-inspection" })}
                  size="lg"
                  className="h-12 px-8 font-semibold"
                  style={{ background: "oklch(var(--teal))" }}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Start New Inspection
                </Button>
                <Button
                  data-ocid="hero.learn_more.secondary_button"
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 font-semibold border-white/30 text-white hover:bg-white/10"
                >
                  Learn More <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="hidden lg:block"
            >
              <img
                src="/assets/generated/hero-inspection.dim_800x600.jpg"
                alt="Vehicle Inspection"
                className="rounded-2xl shadow-2xl w-full object-cover"
                style={{ maxHeight: 380 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-muted"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: `${stat.color}22` }}
                >
                  <stat.icon
                    className="w-5 h-5"
                    style={{ color: stat.color }}
                  />
                </div>
                <div>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-card">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-bold">
                Latest Inspections
              </CardTitle>
              <Button
                data-ocid="dashboard.new_inspection.primary_button"
                onClick={() => navigate({ name: "new-inspection" })}
                size="sm"
                style={{ background: "oklch(var(--teal))" }}
              >
                <Plus className="w-4 h-4 mr-1" /> New Inspection
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div data-ocid="inspections.table" className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Date
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Vehicle
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        License Plate
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Inspector
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider">
                        Status
                      </TableHead>
                      <TableHead className="text-xs font-semibold uppercase tracking-wider text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspLoading
                      ? ["r1", "r2", "r3", "r4"].map((rowId) => (
                          <TableRow key={rowId}>
                            {SKEL_COLS.map((col) => (
                              <TableCell key={col}>
                                <Skeleton className="h-4 w-24" />
                              </TableCell>
                            ))}
                          </TableRow>
                        ))
                      : displayInspections
                        ? displayInspections.map((insp, idx) => {
                            const vehicle = vehicleMap.get(insp.vehicleId);
                            return (
                              <TableRow
                                key={insp.inspectionId}
                                data-ocid={`inspections.item.${idx + 1}`}
                                className="hover:bg-muted/30 transition-colors"
                              >
                                <TableCell className="text-sm">
                                  {formatDate(insp.date)}
                                </TableCell>
                                <TableCell className="text-sm font-medium">
                                  {vehicle
                                    ? `${vehicle.make} ${vehicle.model} ${vehicle.year}`
                                    : insp.vehicleId}
                                </TableCell>
                                <TableCell className="text-sm font-mono">
                                  {vehicle?.licensePlate ?? "—"}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {insp.inspector.toString().slice(0, 12)}...
                                </TableCell>
                                <TableCell>
                                  <StatusBadge status={insp.status} />
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button
                                    data-ocid={`inspections.view.button.${idx + 1}`}
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      navigate({
                                        name: "inspection-detail",
                                        inspectionId: insp.inspectionId,
                                      })
                                    }
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })
                        : SAMPLE_INSPECTIONS.map((insp, idx) => (
                            <TableRow
                              key={insp.inspectionId}
                              data-ocid={`inspections.item.${idx + 1}`}
                              className="hover:bg-muted/30 transition-colors"
                            >
                              <TableCell className="text-sm">
                                {formatDate(insp.date)}
                              </TableCell>
                              <TableCell className="text-sm font-medium">
                                {insp.vehicle.make} {insp.vehicle.model}{" "}
                                {insp.vehicle.year}
                              </TableCell>
                              <TableCell className="text-sm font-mono">
                                {insp.vehicle.licensePlate}
                              </TableCell>
                              <TableCell className="text-sm">
                                {insp.inspector}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={insp.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Eye className="w-3.5 h-3.5 mr-1" /> View
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                  >
                                    <Edit className="w-3.5 h-3.5 mr-1" /> Edit
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                    {!inspLoading && displayInspections?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-10">
                          <div
                            data-ocid="inspections.empty_state"
                            className="text-muted-foreground"
                          >
                            <ClipboardCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">
                              No inspections yet. Start your first inspection!
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: "oklch(var(--navy))" }}
          >
            Simple 3-Step Process
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map(({ step, title, desc, icon: Icon }) => (
              <Card
                key={step}
                className="shadow-card text-center p-6 hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4"
                  style={{ background: "oklch(var(--navy))" }}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div
                  className="text-xs font-bold tracking-widest mb-2"
                  style={{ color: "oklch(var(--teal))" }}
                >
                  STEP {step}
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {desc}
                </p>
              </Card>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2
            className="text-2xl font-bold mb-6 text-center"
            style={{ color: "oklch(var(--navy))" }}
          >
            Key Features
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map(({ title, desc }) => (
              <div
                key={title}
                className="flex items-start gap-3 bg-white rounded-xl p-4 shadow-xs border border-border"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "oklch(var(--teal) / 0.1)" }}
                >
                  <ClipboardCheck
                    className="w-4 h-4"
                    style={{ color: "oklch(var(--teal))" }}
                  />
                </div>
                <div>
                  <div className="font-semibold text-sm mb-0.5">{title}</div>
                  <div className="text-xs text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
