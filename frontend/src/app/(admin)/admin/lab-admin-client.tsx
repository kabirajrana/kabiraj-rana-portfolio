"use client";

import { useCallback } from "react";
import { useEffect, useMemo, useState } from "react";

type DemoType = "Live Model" | "Visualization" | "Tool" | "Coming Soon";
type DemoStatus = "Coming Soon" | "Live" | "Archived";

type DemoItem = {
  id: string;
  title: string;
  description: string;
  type: DemoType;
  status: DemoStatus;
  embedUrl: string;
  expectedDate: string;
  githubUrl: string;
  visible: boolean;
};

type ExperimentStatus = "Completed" | "In Progress" | "Planned";

type ExperimentItem = {
  id: string;
  modelName: string;
  dataset: string;
  accuracy: string;
  f1Score: string;
  date: string;
  notes: string;
  status: ExperimentStatus;
};

type NotebookItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  colabUrl: string;
  lastUpdated: string;
};

const defaultDemos: DemoItem[] = [
  {
    id: crypto.randomUUID(),
    title: "CNN Image Classifier",
    description: "Coming soon showcase for image classification with EfficientNet.",
    type: "Coming Soon",
    status: "Coming Soon",
    embedUrl: "",
    expectedDate: "2026-09-01",
    githubUrl: "https://github.com/kabirajrana",
    visible: true,
  },
  {
    id: crypto.randomUUID(),
    title: "ML Algorithm Comparator",
    description: "Decision boundary visualizer for Random Forest, XGBoost, and SVM.",
    type: "Visualization",
    status: "Live",
    embedUrl: "",
    expectedDate: "",
    githubUrl: "",
    visible: true,
  },
];

const defaultExperiments: ExperimentItem[] = [
  {
    id: crypto.randomUUID(),
    modelName: "CNN Image Classifier",
    dataset: "CIFAR-10 Subset",
    accuracy: "91.4",
    f1Score: "0.90",
    date: "2026-03-28",
    notes: "Transfer learning with EfficientNet baseline and custom augmentation.",
    status: "Completed",
  },
  {
    id: crypto.randomUUID(),
    modelName: "Random Forest Comparator",
    dataset: "Synthetic Decision Boundary Set",
    accuracy: "87.6",
    f1Score: "0.86",
    date: "2026-04-01",
    notes: "Tuning tree depth and estimator count against non-linear boundaries.",
    status: "In Progress",
  },
  {
    id: crypto.randomUUID(),
    modelName: "Logistic Regression Baseline",
    dataset: "Tabular Binary Benchmark",
    accuracy: "82.1",
    f1Score: "0.80",
    date: "2026-04-10",
    notes: "Planned baseline for calibration and feature-scaling experiments.",
    status: "Planned",
  },
];

const defaultNotebooks: NotebookItem[] = [
  {
    id: crypto.randomUUID(),
    title: "CNN Transfer Learning Playbook",
    description:
      "End-to-end notebook for image preprocessing, transfer-learning strategy, and confidence calibration.",
    tags: ["Python", "PyTorch", "OpenCV", "Grad-CAM"],
    colabUrl: "https://colab.research.google.com/",
    lastUpdated: "2026-03-01",
  },
  {
    id: crypto.randomUUID(),
    title: "Model Comparator: RF vs XGBoost vs SVM",
    description: "Interactive notebook comparing model behavior across synthetic and tabular datasets.",
    tags: ["Python", "scikit-learn", "XGBoost", "Matplotlib"],
    colabUrl: "https://colab.research.google.com/",
    lastUpdated: "2026-02-14",
  },
  {
    id: crypto.randomUUID(),
    title: "Experiment Tracking and Metrics Log",
    description: "Reusable evaluation template for accuracy, F1, confidence intervals, and error slices.",
    tags: ["Python", "Pandas", "Seaborn", "MLflow"],
    colabUrl: "https://colab.research.google.com/",
    lastUpdated: "2026-01-20",
  },
];

function toTags(input: string): string[] {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function LabAdminClient() {
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [demos, setDemos] = useState<DemoItem[]>(defaultDemos);
  const [experiments, setExperiments] = useState<ExperimentItem[]>(defaultExperiments);
  const [notebooks, setNotebooks] = useState<NotebookItem[]>(defaultNotebooks);

  const [demoForm, setDemoForm] = useState<Omit<DemoItem, "id" | "visible">>({
    title: "",
    description: "",
    type: "Live Model",
    status: "Coming Soon",
    embedUrl: "",
    expectedDate: "",
    githubUrl: "",
  });
  const [editingDemoId, setEditingDemoId] = useState<string | null>(null);

  const [expForm, setExpForm] = useState<Omit<ExperimentItem, "id">>({
    modelName: "",
    dataset: "",
    accuracy: "",
    f1Score: "",
    date: "",
    notes: "",
    status: "Completed",
  });
  const [editingExpId, setEditingExpId] = useState<string | null>(null);

  const [notebookForm, setNotebookForm] = useState({
    title: "",
    description: "",
    tags: "",
    colabUrl: "",
    lastUpdated: "",
  });
  const [editingNotebookId, setEditingNotebookId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const hydrateFromBackend = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/lab-content", { cache: "no-store" });
      if (!response.ok) {
        setReady(true);
        return;
      }

      const payload = (await response.json()) as {
        demos?: Array<Record<string, unknown>>;
        experiments?: Array<Record<string, unknown>>;
        notebooks?: Array<Record<string, unknown>>;
      };

      if (Array.isArray(payload.demos) && payload.demos.length > 0) {
        const mappedDemos: DemoItem[] = payload.demos.map((item, index) => ({
          id: String(item.id ?? `demo-${index + 1}`),
          title: String(item.title ?? ""),
          description: String(item.description ?? ""),
          type: (String(item.type ?? "Coming Soon") as DemoType),
          status: (String(item.status ?? "Coming Soon") as DemoStatus),
          embedUrl: String(item.embedUrl ?? ""),
          expectedDate: String(item.expectedDate ?? ""),
          githubUrl: String(item.githubUrl ?? ""),
          visible: Boolean(item.visible ?? true),
        }));
        setDemos(mappedDemos);
      }

      if (Array.isArray(payload.experiments) && payload.experiments.length > 0) {
        const mappedExperiments: ExperimentItem[] = payload.experiments.map((item, index) => ({
          id: String(item.id ?? `exp-${index + 1}`),
          modelName: String(item.modelName ?? item.model ?? ""),
          dataset: String(item.dataset ?? ""),
          accuracy: String(item.accuracy ?? ""),
          f1Score: String(item.f1Score ?? item.f1 ?? ""),
          date: String(item.date ?? ""),
          notes: String(item.notes ?? ""),
          status: (String(item.status ?? "Planned") as ExperimentStatus),
        }));
        setExperiments(mappedExperiments);
      }

      if (Array.isArray(payload.notebooks) && payload.notebooks.length > 0) {
        const mappedNotebooks: NotebookItem[] = payload.notebooks.map((item, index) => ({
          id: String(item.id ?? `notebook-${index + 1}`),
          title: String(item.title ?? ""),
          description: String(item.description ?? ""),
          tags: Array.isArray(item.tags)
            ? item.tags.map((tag) => String(tag))
            : Array.isArray(item.stack)
              ? item.stack.map((tag) => String(tag))
              : [],
          colabUrl: String(item.colabUrl ?? "https://colab.research.google.com/"),
          lastUpdated: String(item.lastUpdated ?? ""),
        }));
        setNotebooks(mappedNotebooks);
      }
    } catch {
      // Keep defaults if backend hydrate fails.
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    hydrateFromBackend();
  }, [hydrateFromBackend]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        setSaveError(null);
        const response = await fetch("/api/admin/lab-content", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ demos, experiments, notebooks }),
        });

        if (!response.ok) {
          setSaveError("Unable to sync Lab changes to backend.");
        }
      } catch {
        setSaveError("Unable to sync Lab changes to backend.");
      }
    }, 320);

    return () => window.clearTimeout(timer);
  }, [demos, experiments, notebooks, ready]);

  const statusBreakdown = useMemo(() => {
    return experiments.reduce(
      (acc, item) => {
        acc[item.status] += 1;
        return acc;
      },
      { Completed: 0, "In Progress": 0, Planned: 0 } as Record<ExperimentStatus, number>,
    );
  }, [experiments]);

  function resetDemoForm() {
    setDemoForm({
      title: "",
      description: "",
      type: "Live Model",
      status: "Coming Soon",
      embedUrl: "",
      expectedDate: "",
      githubUrl: "",
    });
    setEditingDemoId(null);
  }

  function handleDemoSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!demoForm.title.trim() || !demoForm.description.trim()) {
      return;
    }

    if (editingDemoId) {
      setDemos((current) =>
        current.map((item) =>
          item.id === editingDemoId
            ? {
                ...item,
                ...demoForm,
              }
            : item,
        ),
      );
      resetDemoForm();
      return;
    }

    setDemos((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        visible: true,
        ...demoForm,
      },
    ]);
    resetDemoForm();
  }

  function resetExpForm() {
    setExpForm({
      modelName: "",
      dataset: "",
      accuracy: "",
      f1Score: "",
      date: "",
      notes: "",
      status: "Completed",
    });
    setEditingExpId(null);
  }

  function handleExperimentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!expForm.modelName.trim() || !expForm.dataset.trim()) {
      return;
    }

    if (editingExpId) {
      setExperiments((current) => current.map((item) => (item.id === editingExpId ? { id: editingExpId, ...expForm } : item)));
      resetExpForm();
      return;
    }

    setExperiments((current) => [...current, { id: crypto.randomUUID(), ...expForm }]);
    resetExpForm();
  }

  function resetNotebookForm() {
    setNotebookForm({
      title: "",
      description: "",
      tags: "",
      colabUrl: "",
      lastUpdated: "",
    });
    setEditingNotebookId(null);
  }

  function handleNotebookSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!notebookForm.title.trim() || !notebookForm.colabUrl.trim()) {
      return;
    }

    const payload: NotebookItem = {
      id: editingNotebookId ?? crypto.randomUUID(),
      title: notebookForm.title,
      description: notebookForm.description,
      tags: toTags(notebookForm.tags),
      colabUrl: notebookForm.colabUrl,
      lastUpdated: notebookForm.lastUpdated,
    };

    if (editingNotebookId) {
      setNotebooks((current) => current.map((item) => (item.id === editingNotebookId ? payload : item)));
      resetNotebookForm();
      return;
    }

    setNotebooks((current) => [...current, payload]);
    resetNotebookForm();
  }

  function moveNotebook(from: number, to: number) {
    if (from === to || from < 0 || to < 0) {
      return;
    }
    setNotebooks((current) => {
      const copy = [...current];
      const [picked] = copy.splice(from, 1);
      copy.splice(to, 0, picked);
      return copy;
    });
  }

  if (!ready) {
    return <p className="py-10 text-sm text-cyan-100/70">Loading admin tools...</p>;
  }

  return (
    <section className="space-y-8 pb-10">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold text-cyan-50">Lab Content Admin</h1>
        <p className="text-sm text-cyan-100/75">Manage demos, experiments, and notebooks for your Lab page.</p>
        {saveError ? <p className="text-sm text-rose-300">{saveError}</p> : <p className="text-xs text-cyan-200/60">Changes auto-sync to backend.</p>}
      </header>

      <article className="space-y-5 rounded-xl border border-cyan-300/20 bg-[#0a0f1e] p-5">
        <h2 className="text-xl font-semibold text-cyan-50">Section 1 - Demo Manager</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleDemoSubmit}>
          <input
            value={demoForm.title}
            onChange={(event) => setDemoForm((prev) => ({ ...prev, title: event.target.value }))}
            placeholder="Title"
            className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100"
          />
          <input
            value={demoForm.description}
            onChange={(event) => setDemoForm((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Description"
            className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100"
          />
          <select
            value={demoForm.type}
            onChange={(event) => setDemoForm((prev) => ({ ...prev, type: event.target.value as DemoType }))}
            className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100"
          >
            <option>Live Model</option>
            <option>Visualization</option>
            <option>Tool</option>
            <option>Coming Soon</option>
          </select>
          <select
            value={demoForm.status}
            onChange={(event) => setDemoForm((prev) => ({ ...prev, status: event.target.value as DemoStatus }))}
            className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100"
          >
            <option>Coming Soon</option>
            <option>Live</option>
            <option>Archived</option>
          </select>
          <input
            value={demoForm.embedUrl}
            onChange={(event) => setDemoForm((prev) => ({ ...prev, embedUrl: event.target.value }))}
            placeholder="Embed URL"
            className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100"
          />
          <input
            type="date"
            value={demoForm.expectedDate}
            onChange={(event) => setDemoForm((prev) => ({ ...prev, expectedDate: event.target.value }))}
            className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100"
          />
          <input
            value={demoForm.githubUrl}
            onChange={(event) => setDemoForm((prev) => ({ ...prev, githubUrl: event.target.value }))}
            placeholder="GitHub URL"
            className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100 md:col-span-2"
          />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-semibold text-[#041124]">
              {editingDemoId ? "Update Demo" : "Add Demo"}
            </button>
            {editingDemoId ? (
              <button type="button" onClick={resetDemoForm} className="rounded-lg border border-cyan-300/25 px-4 py-2 text-sm text-cyan-100">
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="space-y-2">
          {demos.map((demo) => (
            <div key={demo.id} className="rounded-lg border border-cyan-300/15 bg-[#0d1526] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-cyan-50">{demo.title}</p>
                  <p className="text-xs text-cyan-100/70">{demo.type} · {demo.status}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className="inline-flex items-center gap-2 text-xs text-cyan-100/80">
                    <input
                      type="checkbox"
                      checked={demo.visible}
                      onChange={(event) =>
                        setDemos((current) => current.map((item) => (item.id === demo.id ? { ...item, visible: event.target.checked } : item)))
                      }
                    />
                    Visible
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDemoId(demo.id);
                      setDemoForm({
                        title: demo.title,
                        description: demo.description,
                        type: demo.type,
                        status: demo.status,
                        embedUrl: demo.embedUrl,
                        expectedDate: demo.expectedDate,
                        githubUrl: demo.githubUrl,
                      });
                    }}
                    className="rounded border border-cyan-300/25 px-2 py-1 text-xs text-cyan-100"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setDemos((current) => current.filter((item) => item.id !== demo.id))}
                    className="rounded border border-rose-300/30 px-2 py-1 text-xs text-rose-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </article>

      <article className="space-y-5 rounded-xl border border-cyan-300/20 bg-[#0a0f1e] p-5">
        <h2 className="text-xl font-semibold text-cyan-50">Section 2 - Experiment Log Manager</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleExperimentSubmit}>
          <input value={expForm.modelName} onChange={(event) => setExpForm((prev) => ({ ...prev, modelName: event.target.value }))} placeholder="Model Name" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <input value={expForm.dataset} onChange={(event) => setExpForm((prev) => ({ ...prev, dataset: event.target.value }))} placeholder="Dataset" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <input value={expForm.accuracy} onChange={(event) => setExpForm((prev) => ({ ...prev, accuracy: event.target.value }))} placeholder="Accuracy (%)" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <input value={expForm.f1Score} onChange={(event) => setExpForm((prev) => ({ ...prev, f1Score: event.target.value }))} placeholder="F1 Score" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <input type="date" value={expForm.date} onChange={(event) => setExpForm((prev) => ({ ...prev, date: event.target.value }))} className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <select value={expForm.status} onChange={(event) => setExpForm((prev) => ({ ...prev, status: event.target.value as ExperimentStatus }))} className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100">
            <option>Completed</option>
            <option>In Progress</option>
            <option>Planned</option>
          </select>
          <input value={expForm.notes} onChange={(event) => setExpForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="Notes" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100 md:col-span-2" />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-semibold text-[#041124]">{editingExpId ? "Update Experiment" : "Add Experiment"}</button>
            {editingExpId ? (
              <button type="button" onClick={resetExpForm} className="rounded-lg border border-cyan-300/25 px-4 py-2 text-sm text-cyan-100">Cancel</button>
            ) : null}
          </div>
        </form>

        <div className="overflow-x-auto rounded-lg border border-cyan-300/15">
          <table className="min-w-full text-left text-sm text-cyan-100/90">
            <thead className="bg-[#0e1728] text-cyan-200/80">
              <tr>
                <th className="px-3 py-2">Model</th>
                <th className="px-3 py-2">Dataset</th>
                <th className="px-3 py-2">Accuracy</th>
                <th className="px-3 py-2">F1</th>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((item) => (
                <tr key={item.id} className="border-t border-cyan-300/10">
                  <td className="px-3 py-2">{item.modelName}</td>
                  <td className="px-3 py-2">{item.dataset}</td>
                  <td className="px-3 py-2">{item.accuracy}%</td>
                  <td className="px-3 py-2">{item.f1Score}</td>
                  <td className="px-3 py-2">{item.date}</td>
                  <td className="px-3 py-2">{item.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingExpId(item.id);
                          setExpForm({
                            modelName: item.modelName,
                            dataset: item.dataset,
                            accuracy: item.accuracy,
                            f1Score: item.f1Score,
                            date: item.date,
                            notes: item.notes,
                            status: item.status,
                          });
                        }}
                        className="rounded border border-cyan-300/25 px-2 py-1 text-xs"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => setExperiments((current) => current.filter((exp) => exp.id !== item.id))} className="rounded border border-rose-300/30 px-2 py-1 text-xs text-rose-200">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-cyan-200/60">
          Saved locally: {statusBreakdown.Completed} Completed · {statusBreakdown["In Progress"]} In Progress · {statusBreakdown.Planned} Planned
        </p>
      </article>

      <article className="space-y-5 rounded-xl border border-cyan-300/20 bg-[#0a0f1e] p-5">
        <h2 className="text-xl font-semibold text-cyan-50">Section 3 - Notebook Manager</h2>
        <form className="grid gap-3 md:grid-cols-2" onSubmit={handleNotebookSubmit}>
          <input value={notebookForm.title} onChange={(event) => setNotebookForm((prev) => ({ ...prev, title: event.target.value }))} placeholder="Title" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <input value={notebookForm.colabUrl} onChange={(event) => setNotebookForm((prev) => ({ ...prev, colabUrl: event.target.value }))} placeholder="Colab URL" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <input value={notebookForm.tags} onChange={(event) => setNotebookForm((prev) => ({ ...prev, tags: event.target.value }))} placeholder="Tech tags (comma-separated)" className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <input type="date" value={notebookForm.lastUpdated} onChange={(event) => setNotebookForm((prev) => ({ ...prev, lastUpdated: event.target.value }))} className="rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100" />
          <textarea value={notebookForm.description} onChange={(event) => setNotebookForm((prev) => ({ ...prev, description: event.target.value }))} placeholder="Description" className="min-h-[90px] rounded-lg border border-cyan-300/20 bg-[#0d1628] px-3 py-2 text-cyan-100 md:col-span-2" />
          <div className="flex gap-2 md:col-span-2">
            <button type="submit" className="rounded-lg bg-[#00d4ff] px-4 py-2 text-sm font-semibold text-[#041124]">{editingNotebookId ? "Update Notebook" : "Add Notebook"}</button>
            {editingNotebookId ? (
              <button type="button" onClick={resetNotebookForm} className="rounded-lg border border-cyan-300/25 px-4 py-2 text-sm text-cyan-100">Cancel</button>
            ) : null}
          </div>
        </form>

        <div className="space-y-2">
          {notebooks.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => {
                if (dragIndex !== null) {
                  moveNotebook(dragIndex, index);
                }
                setDragIndex(null);
              }}
              className="rounded-lg border border-cyan-300/15 bg-[#0d1526] p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium text-cyan-50">{item.title} {index === 0 ? <span className="text-xs text-cyan-300">(Featured)</span> : null}</p>
                  <p className="text-xs text-cyan-100/70">{item.tags.join(" · ")} · Updated {item.lastUpdated || "N/A"}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNotebookId(item.id);
                      setNotebookForm({
                        title: item.title,
                        description: item.description,
                        tags: item.tags.join(", "),
                        colabUrl: item.colabUrl,
                        lastUpdated: item.lastUpdated,
                      });
                    }}
                    className="rounded border border-cyan-300/25 px-2 py-1 text-xs text-cyan-100"
                  >
                    Edit
                  </button>
                  <button type="button" onClick={() => setNotebooks((current) => current.filter((nb) => nb.id !== item.id))} className="rounded border border-rose-300/30 px-2 py-1 text-xs text-rose-200">Delete</button>
                </div>
              </div>
              <p className="mt-2 text-xs text-cyan-200/60">Drag to reorder. The first notebook becomes featured on the Lab page.</p>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
