export const researchFilters = ["All", "Experiments", "Model Architecture", "Dataset Studies", "System Design"] as const;

export type ResearchFilter = (typeof researchFilters)[number];

export type ResearchCategory = Exclude<ResearchFilter, "All">;

export type ResearchSectionKey =
	| "algorithm-experiments"
	| "architecture-deep-dives"
	| "experiment-logs"
	| "dataset-analysis"
	| "system-design-notes";

export type ResearchEntry = {
	id: string;
	title: string;
	description: string;
	category: ResearchCategory;
	section: ResearchSectionKey;
	dataset: string;
	algorithms: string[];
	metrics: string[];
	results: string;
	tags: string[];
	problemStatement?: string;
	evaluationMetrics?: string;
	resultSummary?: string;
	experimentSetup?: string;
	observations?: string;
	architectureDiagram?: string[];
	visualBreakdown?: string[];
	implementationSnippet?: string;
	visualizations?: string[];
	pipeline?: string[];
};

export const researchEntries: ResearchEntry[] = [
	{
		id: "rf-xgb-performance-study",
		title: "Random Forest vs XGBoost Performance Study",
		description:
			"Benchmarking tree-based ensembles for imbalanced multi-class classification under strict generalization constraints.",
		category: "Experiments",
		section: "algorithm-experiments",
		dataset: "UCI Credit Card Default + synthetic class-balance augmentation",
		algorithms: ["Random Forest", "XGBoost"],
		metrics: ["ROC-AUC", "Macro F1", "Precision@Recall>=0.8", "Inference Latency"],
		results:
			"XGBoost improved macro F1 by 6.8% with calibrated thresholds, while Random Forest stayed more stable under noisy features.",
		tags: ["ensemble-learning", "classification", "imbalance", "calibration"],
		problemStatement:
			"Identify which ensemble approach best balances recall and precision for high-risk class detection with constrained false positives.",
		evaluationMetrics:
			"Primary: Macro F1 and ROC-AUC. Secondary: Precision@Recall>=0.8 and median inference latency on CPU.",
		resultSummary:
			"XGBoost wins on discriminative power; Random Forest remains competitive for robustness and simpler operational tuning.",
	},
	{
		id: "logreg-svm-classification",
		title: "Logistic Regression vs SVM on Classification Tasks",
		description:
			"Comparing linear and kernel-based decision boundaries for medium-dimensional sparse-text and tabular tasks.",
		category: "Experiments",
		section: "algorithm-experiments",
		dataset: "SMS Spam Collection + Employee Attrition Tabular Benchmark",
		algorithms: ["Logistic Regression", "Linear SVM", "RBF SVM"],
		metrics: ["Accuracy", "F1 Score", "PR-AUC", "Training Time"],
		results:
			"Linear models converged faster and generalized well; RBF SVM improved boundary-sensitive cases but required careful scaling.",
		tags: ["linear-models", "svm", "text-classification", "kernel-methods"],
		problemStatement:
			"Assess whether increased margin complexity from kernel SVM materially improves production-grade classification performance.",
		evaluationMetrics:
			"PR-AUC and F1 tracked minority-class behavior; training time and model size measured deployment practicality.",
		resultSummary:
			"Linear SVM delivered the strongest speed-quality tradeoff; kernel SVM only justified for non-linear pockets.",
	},
	{
		id: "cnn-transfer-image",
		title: "CNN vs Transfer Learning for Image Recognition",
		description:
			"Evaluating custom CNN from scratch against transfer learning baselines under limited labeled image budgets.",
		category: "Experiments",
		section: "algorithm-experiments",
		dataset: "CIFAR-10 subset + custom object dataset (6 classes)",
		algorithms: ["Custom CNN", "ResNet50 Transfer Learning", "EfficientNet-B0 Fine-tune"],
		metrics: ["Top-1 Accuracy", "Validation Loss", "Epoch Efficiency", "Model Size"],
		results:
			"Transfer learning reached target accuracy in fewer epochs; custom CNN remained useful for edge-friendly deployment constraints.",
		tags: ["computer-vision", "transfer-learning", "fine-tuning", "resource-constraints"],
		problemStatement:
			"Determine practical model strategy when dataset size is limited but deployment constraints vary across edge and cloud targets.",
		evaluationMetrics:
			"Measured convergence speed and final generalization, with model size as a proxy for deployment feasibility.",
		resultSummary:
			"EfficientNet fine-tune gave best speed-to-accuracy ratio; custom CNN best for strict runtime/memory limits.",
	},
	{
		id: "transformer-architecture",
		title: "Transformer Architecture Explained",
		description: "Token flow analysis from embedding to multi-head attention, feed-forward blocks, and decoding strategies.",
		category: "Model Architecture",
		section: "architecture-deep-dives",
		dataset: "WikiText-2 language modeling sample",
		algorithms: ["Self-Attention", "Positional Encoding", "LayerNorm", "Residual Connections"],
		metrics: ["Perplexity", "Attention Entropy", "Throughput tokens/s"],
		results: "Layer-wise attention diagnostics exposed long-range dependency capture and context-window tradeoffs.",
		tags: ["transformers", "nlp", "attention", "sequence-modeling"],
		architectureDiagram: ["Input Tokens", "Embedding + Positional Encoding", "Multi-Head Attention", "FFN", "Output Head"],
		visualBreakdown: [
			"Scaled dot-product attention behavior under different sequence lengths",
			"Residual path effect on gradient stability",
			"Head specialization patterns across layers",
		],
		implementationSnippet: `def attention(q, k, v):\n    scores = (q @ k.transpose(-2, -1)) / (q.size(-1) ** 0.5)\n    weights = scores.softmax(dim=-1)\n    return weights @ v`,
	},
	{
		id: "cnn-breakdown",
		title: "Convolutional Neural Networks Breakdown",
		description: "Understanding receptive fields, hierarchical feature extraction, and pooling effects in visual representations.",
		category: "Model Architecture",
		section: "architecture-deep-dives",
		dataset: "Fashion-MNIST + mini-ImageNet slices",
		algorithms: ["Convolution", "BatchNorm", "Max Pooling", "Global Average Pooling"],
		metrics: ["Validation Accuracy", "Activation Sparsity", "Gradient Norm"],
		results: "Intermediate activation maps verified progressive abstraction from edges to object-specific motifs.",
		tags: ["cnn", "vision", "feature-extraction"],
		architectureDiagram: ["Input Image", "Conv Block Stack", "Feature Maps", "Classifier Head"],
		visualBreakdown: [
			"Kernel size impact on local pattern capture",
			"Pooling strategy vs spatial information retention",
			"Activation map evolution through depth",
		],
		implementationSnippet: `model = nn.Sequential(\n    nn.Conv2d(3, 32, kernel_size=3, padding=1),\n    nn.ReLU(),\n    nn.MaxPool2d(2),\n    nn.Conv2d(32, 64, kernel_size=3, padding=1)\n)`,
	},
	{
		id: "attention-mechanism",
		title: "Attention Mechanism in Modern AI",
		description: "Comparative study of additive, multiplicative, and multi-head attention in sequence tasks.",
		category: "Model Architecture",
		section: "architecture-deep-dives",
		dataset: "IWSLT Translation Sample",
		algorithms: ["Bahdanau Attention", "Scaled Dot-Product Attention", "Multi-Head Attention"],
		metrics: ["BLEU", "Alignment Sharpness", "Inference Throughput"],
		results: "Multi-head attention improved contextual fidelity while preserving practical decoding speed.",
		tags: ["attention", "sequence", "nlp", "interpretability"],
		architectureDiagram: ["Encoder States", "Query-Key Matching", "Attention Weights", "Context Vector"],
		visualBreakdown: [
			"Alignment heatmap interpretation",
			"Head diversity and contextual specialization",
			"Tradeoff between precision and throughput",
		],
		implementationSnippet: `attn = torch.softmax((Q @ K.transpose(-2, -1)) / math.sqrt(dk), dim=-1)\ncontext = attn @ V`,
	},
	{
		id: "gradient-boosting-internals",
		title: "Gradient Boosting Internals",
		description: "Stage-wise additive modeling behavior and residual error correction mechanics in boosting systems.",
		category: "Model Architecture",
		section: "architecture-deep-dives",
		dataset: "House Prices Regression Benchmark",
		algorithms: ["Gradient Boosting", "Shrinkage", "Tree Depth Regularization"],
		metrics: ["RMSE", "MAE", "Feature Importance Stability"],
		results: "Conservative learning rates with depth control produced best out-of-fold reliability.",
		tags: ["boosting", "tabular-ml", "regression"],
		architectureDiagram: ["Initial Baseline", "Residual Computation", "Weak Learner Fit", "Additive Update", "Final Ensemble"],
		visualBreakdown: [
			"Residual distribution tightening across rounds",
			"Learning-rate and depth interaction",
			"Importance drift with additional estimators",
		],
		implementationSnippet: `for _ in range(n_estimators):\n    residuals = y - model.predict(X)\n    tree.fit(X, residuals)\n    model += lr * tree`,
	},
	{
		id: "feature-engineering-log",
		title: "Feature Engineering Experiments",
		description: "Systematic exploration of encoding, scaling, and feature synthesis for tabular model uplift.",
		category: "Experiments",
		section: "experiment-logs",
		dataset: "Youth Migration & Socioeconomic Indicators",
		algorithms: ["Target Encoding", "Robust Scaling", "Interaction Features"],
		metrics: ["Cross-validated F1", "Lift vs Baseline"],
		results: "Interaction features improved cross-validated F1 by 4.1% over baseline preprocessing.",
		tags: ["feature-engineering", "tabular", "experiment-log"],
		experimentSetup: "Compared 12 feature pipelines using fixed random seed and stratified K-fold validation.",
		observations: "Most gains came from domain-driven interaction terms rather than brute-force polynomial expansion.",
	},
	{
		id: "hyperparameter-tuning-log",
		title: "Hyperparameter Tuning Study",
		description: "Bayesian optimization and grid-search comparison for balanced quality-cost model tuning.",
		category: "Experiments",
		section: "experiment-logs",
		dataset: "Customer Churn Classification Benchmark",
		algorithms: ["Bayesian Optimization", "Grid Search", "Early Stopping"],
		metrics: ["AUC", "Optimization Time", "Generalization Gap"],
		results: "Bayesian optimization found competitive AUC in 37% less search time than exhaustive grid.",
		tags: ["tuning", "optimization", "experiment-log"],
		experimentSetup: "Tracked trial budget, wall-clock training time, and holdout AUC for every configuration.",
		observations: "Narrowed parameter priors around learning-rate and tree-depth delivered fastest convergence.",
	},
	{
		id: "overfitting-regularization-log",
		title: "Overfitting vs Regularization Investigation",
		description: "Measuring dropout, weight decay, and data augmentation effects on generalization behavior.",
		category: "Experiments",
		section: "experiment-logs",
		dataset: "Image Classification Validation Suite",
		algorithms: ["Dropout", "L2 Regularization", "Data Augmentation"],
		metrics: ["Train/Validation Gap", "Top-1 Accuracy", "Loss Curves"],
		results: "Moderate augmentation plus weight decay reduced train-validation gap by 28%.",
		tags: ["regularization", "generalization", "experiment-log"],
		experimentSetup: "Ran 18 controlled experiments with one-factor-at-a-time regularization adjustments.",
		observations: "Excessive dropout reduced representational capacity; balanced regularization gave best stability.",
	},
	{
		id: "evaluation-pipeline-log",
		title: "Model Evaluation Pipeline",
		description: "Building reproducible evaluation checks with confidence intervals and drift-aware slices.",
		category: "Experiments",
		section: "experiment-logs",
		dataset: "Temporal Fraud Detection Snapshots",
		algorithms: ["Time-based Split", "Bootstrap CI", "Slice Evaluation"],
		metrics: ["AUC by Cohort", "Calibration Error", "95% CI"],
		results: "Slice-based evaluation surfaced segment drift hidden by aggregate metrics.",
		tags: ["evaluation", "mlops", "experiment-log"],
		experimentSetup: "Automated nightly evaluation pipeline with cohort-wise report generation.",
		observations: "Calibration degraded first in low-frequency segments, motivating dynamic threshold monitoring.",
	},
	{
		id: "youth-migration-analysis",
		title: "Youth Migration Dataset Analysis",
		description: "EDA on migration movement, economic factors, and educational indicators.",
		category: "Dataset Studies",
		section: "dataset-analysis",
		dataset: "Youth Migration Longitudinal Dataset",
		algorithms: ["EDA", "Outlier Detection", "Temporal Aggregation"],
		metrics: ["Missingness Ratio", "Outlier Density", "Trend Stability"],
		results: "Regional employment and education indicators emerged as the strongest correlated movement drivers.",
		tags: ["eda", "migration", "dataset-study"],
		visualizations: ["Correlation Heatmap", "Distribution Plot", "Feature Importance Chart"],
	},
	{
		id: "feature-correlation-study",
		title: "Feature Correlation Study",
		description: "Analyzing multicollinearity and redundant features before model training.",
		category: "Dataset Studies",
		section: "dataset-analysis",
		dataset: "Socioeconomic and Behavioral Signals Dataset",
		algorithms: ["Spearman Correlation", "VIF Analysis", "PCA Diagnostics"],
		metrics: ["Correlation Coefficient", "VIF", "Explained Variance"],
		results: "Correlation clustering reduced redundant features by 22% while preserving predictive signal.",
		tags: ["feature-selection", "correlation", "dataset-study"],
		visualizations: ["Correlation Heatmap", "Distribution Plot", "Feature Importance Chart"],
	},
	{
		id: "data-distribution-analysis",
		title: "Data Distribution Analysis",
		description: "Investigating skewness, class imbalance, and transformation impact on model behavior.",
		category: "Dataset Studies",
		section: "dataset-analysis",
		dataset: "Multi-source Customer Intelligence Dataset",
		algorithms: ["Distribution Fitting", "Power Transform", "Class Reweighting"],
		metrics: ["Skewness", "Class Balance Ratio", "Post-transform Stability"],
		results: "Targeted transformation reduced long-tail effects and improved training stability.",
		tags: ["data-quality", "imbalance", "dataset-study"],
		visualizations: ["Correlation Heatmap", "Distribution Plot", "Feature Importance Chart"],
	},
	{
		id: "ml-pipeline-architecture",
		title: "Machine Learning Pipeline Architecture",
		description: "End-to-end architecture from raw data ingestion to model serving and monitoring.",
		category: "System Design",
		section: "system-design-notes",
		dataset: "Streaming + Batch Unified Data Layer",
		algorithms: ["Feature Store", "Training Orchestration", "Model Registry"],
		metrics: ["Pipeline Latency", "Data Freshness", "SLA Compliance"],
		results: "Modular pipeline layout improved reproducibility and reduced deployment rollback risk.",
		tags: ["mlops", "system-design", "architecture"],
		pipeline: ["Data", "Feature Engineering", "Model Training", "Evaluation", "Deployment", "API"],
	},
	{
		id: "data-processing-pipeline",
		title: "Data Processing Pipeline",
		description: "Reliable preprocessing and validation flow for robust feature generation.",
		category: "System Design",
		section: "system-design-notes",
		dataset: "Operational Event and User Profile Streams",
		algorithms: ["Schema Validation", "Feature Normalization", "Data Versioning"],
		metrics: ["Schema Error Rate", "Throughput", "Data Drift Alerts"],
		results: "Automated validation gates reduced downstream training failures and data quality regressions.",
		tags: ["data-pipeline", "reliability", "system-design"],
		pipeline: ["Data", "Feature Engineering", "Model Training", "Evaluation", "Deployment", "API"],
	},
	{
		id: "model-training-workflow",
		title: "Model Training Workflow",
		description: "Structured training lifecycle with experiment tracking and reproducible artifact management.",
		category: "System Design",
		section: "system-design-notes",
		dataset: "Versioned Training Corpora",
		algorithms: ["Experiment Tracking", "Checkpointing", "Validation Gates"],
		metrics: ["Run Reproducibility", "Best-Model Lift", "Training Cost"],
		results: "Workflow standardization improved model lineage traceability and auditability.",
		tags: ["training", "workflow", "system-design"],
		pipeline: ["Data", "Feature Engineering", "Model Training", "Evaluation", "Deployment", "API"],
	},
	{
		id: "model-deployment-system",
		title: "Model Deployment System",
		description: "Deployment strategy with staged rollout, shadow testing, and post-deploy health checks.",
		category: "System Design",
		section: "system-design-notes",
		dataset: "Online Inference Event Logs",
		algorithms: ["Canary Release", "Shadow Evaluation", "Monitoring + Alerting"],
		metrics: ["Prediction Latency", "Error Budget", "Model Drift"],
		results: "Staged rollout policy lowered deployment incidents and improved model reliability in production.",
		tags: ["deployment", "serving", "system-design"],
		pipeline: ["Data", "Feature Engineering", "Model Training", "Evaluation", "Deployment", "API"],
	},
];

export const researchSections = [
	{
		key: "algorithm-experiments" as const,
		title: "Algorithm Experiments",
		description: "Comparative studies of machine learning models with explicit datasets, metrics, and measurable outcomes.",
	},
	{
		key: "architecture-deep-dives" as const,
		title: "Model Architecture Deep Dives",
		description: "Technical decomposition of modern model families with diagrams and implementation-oriented thinking.",
	},
	{
		key: "experiment-logs" as const,
		title: "Machine Learning Experiment Logs",
		description: "Research-log style notes from iterative experimentation, tuning cycles, and post-run observations.",
	},
	{
		key: "dataset-analysis" as const,
		title: "Dataset Analysis Studies",
		description: "Structured exploratory analysis with emphasis on data quality, feature relationships, and decision-ready insights.",
	},
	{
		key: "system-design-notes" as const,
		title: "AI System Design Notes",
		description: "Production-minded architecture notes across pipeline engineering, training workflows, and deployment strategy.",
	},
];