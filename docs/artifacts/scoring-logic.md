```mermaid
graph TB
    subgraph "Input Data"
        LOAN[💰 Loan Application<br/>Amount: $50,000<br/>Term: 60 months<br/>Income: $75,000<br/>Credit: 720<br/>DTI: 0.35<br/>Employment: 3 years]
    end
    
    subgraph "Scoring Weights"
        W1[📊 Credit Score<br/>Weight: 35%<br/>Range: 300-850<br/>Normalized: 0-1]
        W2[💵 Debt-to-Income<br/>Weight: 25%<br/>Range: 0-1<br/>Lower is Better]
        W3[💼 Income vs Amount<br/>Weight: 25%<br/>Loan-to-Income Ratio<br/>Lower is Better]
        W4[⏱️ Employment History<br/>Weight: 10%<br/>Years of Stability<br/>More is Better]
        W5[📅 Loan Term<br/>Weight: 5%<br/>Term Length Impact<br/>Shorter is Better]
    end
    
    subgraph "Guardrails & Hard Rules"
        G1[🚫 Credit Score < 500<br/>Automatic Rejection<br/>Override: None]
        G2[🚫 DTI Ratio > 60%<br/>Automatic Rejection<br/>High Risk Threshold]
        G3[⚠️ EMI > 40% Income<br/>Automatic Rejection<br/>Payment Capacity]
        G4[📈 Score Cap at 0.65<br/>Maximum Achievable<br/>Conservative Limit]
    end
    
    subgraph "Scoring Calculation"
        CALC[🧮 Weighted Sum<br/>Score = Σ(weight × normalized_value)<br/>Range: 0.0 - 0.65<br/>Example: 0.58]
    end
    
    subgraph "Decision Thresholds"
        T1[✅ Score ≥ 0.70<br/>APPROVED<br/>High Confidence]
        T2[📋 Score ≥ 0.55<br/>UNDER REVIEW<br/>Manual Assessment]
        T3[❌ Score < 0.55<br/>REJECTED<br/>Low Confidence]
    end
    
    subgraph "Explanation Generation"
        REASONS[💭 Reason Generation<br/>3-6 Explanations<br/>Business Language<br/>Positive & Negative Signals]
        
        POSITIVE[➕ Positive Factors<br/>- Excellent credit score<br/>- Stable employment<br/>- Reasonable loan amount]
        
        NEGATIVE[➖ Risk Factors<br/>- High debt-to-income ratio<br/>- Long loan term<br/>- Income concerns]
    end
    
    subgraph "Final Decision"
        DECISION[📋 Decision Output<br/>Status: UNDER_REVIEW<br/>Score: 0.58<br/>Confidence: 0.82<br/>Model: rule_based]
    end
    
    subgraph "Alternative: Logistic Model"
        LOGISTIC[🤖 Logistic Regression<br/>Coefficients: [-2.1, 3.5, -1.8, 0.9, -0.3]<br/>Sigmoid Output: 0-1<br/>Same Guardrails Apply]
    end
    
    %% Flow
    LOAN --> W1
    LOAN --> W2  
    LOAN --> W3
    LOAN --> W4
    LOAN --> W5
    
    W1 --> G1
    W2 --> G2
    W3 --> G3
    
    G1 --> CALC
    G2 --> CALC
    G3 --> CALC
    W1 --> CALC
    W2 --> CALC
    W3 --> CALC
    W4 --> CALC
    W5 --> CALC
    
    CALC --> G4
    G4 --> T1
    G4 --> T2
    G4 --> T3
    
    T1 --> REASONS
    T2 --> REASONS
    T3 --> REASONS
    
    REASONS --> POSITIVE
    REASONS --> NEGATIVE
    
    POSITIVE --> DECISION
    NEGATIVE --> DECISION
    
    %% Alternative path
    LOAN -.-> LOGISTIC
    LOGISTIC -.-> G1
    LOGISTIC -.-> G2
    LOGISTIC -.-> G3
    
    %% Styling
    classDef inputStyle fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    classDef weightStyle fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    classDef guardrailStyle fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef calcStyle fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px
    classDef thresholdStyle fill:#fff8e1,stroke:#f57c00,stroke-width:2px
    classDef reasonStyle fill:#f1f8e9,stroke:#558b2f,stroke-width:2px
    classDef decisionStyle fill:#e0f2f1,stroke:#00695c,stroke-width:2px
    classDef altStyle fill:#fce4ec,stroke:#ad1457,stroke-width:2px
    
    class LOAN inputStyle
    class W1,W2,W3,W4,W5 weightStyle
    class G1,G2,G3,G4 guardrailStyle
    class CALC calcStyle
    class T1,T2,T3 thresholdStyle
    class REASONS,POSITIVE,NEGATIVE reasonStyle
    class DECISION decisionStyle
    class LOGISTIC altStyle
```

# AI Scoring Logic & Decision Engine

## Scoring Framework Overview
The AI Loan Approval System uses a transparent, rule-based scoring approach with optional logistic regression model support.

## Weighted Scoring Components

### Credit Score (35% Weight)
- **Range**: 300-850 FICO score
- **Normalization**: (score - 300) / 550
- **Impact**: Primary factor in creditworthiness assessment
- **Example**: Score 720 → Normalized 0.76 → Weighted 0.27

### Debt-to-Income Ratio (25% Weight)  
- **Range**: 0.0 - 1.0 (0% - 100%)
- **Normalization**: 1 - DTI ratio (inverted, lower is better)
- **Impact**: Payment capacity assessment
- **Example**: DTI 0.35 → Normalized 0.65 → Weighted 0.16

### Income vs Loan Amount (25% Weight)
- **Calculation**: Loan amount / Annual income
- **Normalization**: 1 - (loan/income ratio), capped at 1.0
- **Impact**: Loan size relative to income
- **Example**: $50k/$75k = 0.67 → Normalized 0.33 → Weighted 0.08

### Employment History (10% Weight)
- **Range**: 0+ years of employment
- **Normalization**: Min(years/10, 1.0) 
- **Impact**: Employment stability indicator
- **Example**: 3 years → Normalized 0.30 → Weighted 0.03

### Loan Term (5% Weight)
- **Range**: 12-360 months
- **Normalization**: 1 - (term-12)/(360-12), inverted
- **Impact**: Term length risk assessment
- **Example**: 60 months → Normalized 0.86 → Weighted 0.04

## Guardrails & Hard Rules

### Automatic Rejection Criteria
- **Credit Score < 500**: Immediate rejection, no override
- **DTI Ratio > 60%**: High risk threshold exceeded
- **EMI > 40% of Income**: Payment capacity exceeded
- **Score Cap at 0.65**: Conservative maximum achievable score

### Business Logic Validation
- All guardrails checked before score calculation
- Hard rejections bypass scoring entirely
- Conservative risk management approach

## Decision Thresholds

### Approval Criteria (Score ≥ 0.70)
- **Status**: APPROVED
- **Confidence**: High
- **Processing**: Automatic approval

### Review Criteria (0.55 ≤ Score < 0.70)  
- **Status**: UNDER_REVIEW
- **Confidence**: Medium
- **Processing**: Manual underwriter assessment

### Rejection Criteria (Score < 0.55)
- **Status**: REJECTED  
- **Confidence**: Low
- **Processing**: Automatic rejection

## Explanation System

### Reason Generation
- **Count**: 3-6 explanations per decision
- **Language**: Business-friendly, non-technical
- **Balance**: Mix of positive and negative factors
- **Transparency**: Clear rationale for decisions

### Example Explanations
- **Positive**: "Excellent credit score demonstrates reliability"
- **Negative**: "High debt-to-income ratio increases payment risk"
- **Neutral**: "Employment history shows moderate stability"

## Alternative Model: Logistic Regression

### Implementation
- **Coefficients**: [-2.1, 3.5, -1.8, 0.9, -0.3] (hardcoded)
- **Output**: Sigmoid function (0-1 probability)
- **Activation**: Environment variable `AI_MODEL=logistic`
- **Guardrails**: Same hard rules apply to ML output

### Model Toggle
- **Rule-based** (default): Transparent, auditable
- **Logistic**: ML-based probability with same thresholds
- **Future**: Neural networks, ensemble methods
