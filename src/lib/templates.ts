// Document templates for quick start options

export const templates = {
  report: {
    name: "report.typ",
    content: `#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 3cm),
  header: [
    #set text(8pt)
    #smallcaps[Company Report]
    #h(1fr)
    #datetime.today().display()
  ],
  footer: [
    #set align(center)
    #set text(8pt)
    #counter(page).display("1 / 1", both: true)
  ],
)

#set text(
  font: "New Computer Modern",
  size: 11pt,
)

#set heading(numbering: "1.1")

#align(center)[
  #text(size: 28pt, weight: "bold")[
    Professional Report
  ]
  
  #v(0.5em)
  
  #text(size: 14pt, fill: gray)[
    Quarterly Analysis & Findings
  ]
  
  #v(1em)
  
  #text(size: 12pt)[
    Author Name \\
    Department of Analysis \\
    #datetime.today().display("[month repr:long] [day], [year]")
  ]
]

#v(2em)

#outline(title: "Table of Contents", indent: auto)

#pagebreak()

= Executive Summary

This report provides a comprehensive analysis of the quarterly performance metrics and strategic recommendations for the upcoming period.

Key findings include:
- Performance exceeded targets by 15%
- Customer satisfaction improved significantly
- New market opportunities identified

= Introduction

== Background

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

== Objectives

The primary objectives of this analysis are:
+ Evaluate current performance metrics
+ Identify areas for improvement
+ Develop actionable recommendations

= Methodology

#figure(
  table(
    columns: 3,
    stroke: 0.5pt,
    inset: 8pt,
    [*Metric*], [*Target*], [*Actual*],
    [Revenue], [\$1.2M], [\$1.38M],
    [Users], [10,000], [12,450],
    [Retention], [85%], [89%],
  ),
  caption: [Key Performance Indicators],
)

= Findings

== Quantitative Analysis

Our analysis reveals significant improvements across all measured dimensions.

$ "Growth Rate" = (V_f - V_i) / V_i times 100% $

== Qualitative Insights

User feedback indicates strong satisfaction with recent improvements.

= Recommendations

Based on our findings, we recommend:
- Continued investment in user experience
- Expansion into adjacent markets
- Enhanced analytics capabilities

= Conclusion

The analysis demonstrates positive momentum and identifies clear opportunities for continued growth.
`
  },
  
  slides: {
    name: "presentation.typ",
    content: `#import "@preview/polylux:0.3.1": *

#set page(paper: "presentation-16-9")
#set text(font: "Fira Sans", size: 20pt)

#let title-slide(title, subtitle: none, author: none) = {
  polylux-slide[
    #align(center + horizon)[
      #text(size: 48pt, weight: "bold", fill: rgb("#1e3a5f"))[#title]
      
      #if subtitle != none {
        v(0.5em)
        text(size: 24pt, fill: gray)[#subtitle]
      }
      
      #if author != none {
        v(2em)
        text(size: 18pt)[#author]
      }
    ]
  ]
}

#let slide(title, body) = {
  polylux-slide[
    #text(size: 32pt, weight: "bold", fill: rgb("#1e3a5f"))[#title]
    #v(0.5em)
    #line(length: 100%, stroke: 2pt + rgb("#f59e0b"))
    #v(1em)
    #body
  ]
}

#title-slide(
  "Presentation Title",
  subtitle: "A compelling subtitle goes here",
  author: "Your Name • December 2024"
)

#slide("Agenda")[
  #set text(size: 24pt)
  
  + Introduction & Context
  + Key Findings
  + Analysis & Insights
  + Recommendations
  + Next Steps
]

#slide("Introduction")[
  #grid(
    columns: (1fr, 1fr),
    gutter: 2em,
    [
      == The Challenge
      
      - Complex market dynamics
      - Evolving customer needs
      - Competitive pressures
    ],
    [
      == Our Approach
      
      - Data-driven analysis
      - Customer-centric focus
      - Agile methodology
    ]
  )
]

#slide("Key Metrics")[
  #align(center)[
    #grid(
      columns: 3,
      gutter: 2em,
      [
        #rect(fill: rgb("#1e3a5f"), radius: 8pt, width: 150pt, height: 100pt)[
          #align(center + horizon)[
            #text(fill: white, size: 36pt, weight: "bold")[+42%]
            #v(0.3em)
            #text(fill: white.darken(20%), size: 14pt)[Growth Rate]
          ]
        ]
      ],
      [
        #rect(fill: rgb("#f59e0b"), radius: 8pt, width: 150pt, height: 100pt)[
          #align(center + horizon)[
            #text(fill: white, size: 36pt, weight: "bold")[98%]
            #v(0.3em)
            #text(fill: white.darken(20%), size: 14pt)[Satisfaction]
          ]
        ]
      ],
      [
        #rect(fill: rgb("#22c55e"), radius: 8pt, width: 150pt, height: 100pt)[
          #align(center + horizon)[
            #text(fill: white, size: 36pt, weight: "bold")[2.5M]
            #v(0.3em)
            #text(fill: white.darken(20%), size: 14pt)[Active Users]
          ]
        ]
      ],
    )
  ]
]

#slide("Recommendations")[
  #set text(size: 22pt)
  
  #grid(
    columns: 2,
    gutter: 1.5em,
    [
      #rect(fill: luma(245), radius: 4pt, inset: 1em)[
        *Short Term*
        - Optimize current processes
        - Quick wins implementation
        - Team alignment
      ]
    ],
    [
      #rect(fill: luma(245), radius: 4pt, inset: 1em)[
        *Long Term*
        - Strategic investments
        - Platform expansion
        - Market development
      ]
    ]
  )
]

#slide("Thank You")[
  #align(center + horizon)[
    #text(size: 36pt, weight: "bold")[Questions?]
    
    #v(2em)
    
    #text(size: 18pt, fill: gray)[
      your.email\@company.com \\
      \@yourhandle
    ]
  ]
]
`
  },
  
  article: {
    name: "article.typ",
    content: `#set page(
  paper: "a4",
  margin: (x: 3cm, y: 3.5cm),
  columns: 2,
  footer: [
    #set align(center)
    #set text(8pt)
    #counter(page).display()
  ],
)

#set text(
  font: "New Computer Modern",
  size: 10pt,
)

#set par(
  justify: true,
  leading: 0.52em,
  first-line-indent: 1.5em,
)

#set heading(numbering: "1.")

#show heading.where(level: 1): it => {
  set text(size: 12pt)
  block(above: 1.5em, below: 0.8em)[#it]
}

#show heading.where(level: 2): it => {
  set text(size: 10pt)
  block(above: 1.2em, below: 0.6em)[#it]
}

// Title block spanning both columns
#place(
  top,
  scope: "parent",
  float: true,
  [
    #align(center)[
      #text(size: 18pt, weight: "bold")[
        Title of the Academic Article
      ]
      
      #v(0.8em)
      
      #text(size: 11pt)[
        Author One#super[1], Author Two#super[2], Author Three#super[1]
      ]
      
      #v(0.5em)
      
      #text(size: 9pt, style: "italic")[
        #super[1]Department of Computer Science, University Name \\
        #super[2]Institute of Technology, Research Center
      ]
      
      #v(1em)
      
      #rect(fill: luma(245), inset: 1em, width: 100%)[
        #set par(first-line-indent: 0pt)
        #set text(size: 9pt)
        *Abstract* — This paper presents a comprehensive study of the research topic. We propose a novel approach that demonstrates significant improvements over existing methods. Our experimental results show that the proposed technique achieves state-of-the-art performance on standard benchmarks.
        
        #v(0.5em)
        
        *Keywords* — research, methodology, analysis, innovation
      ]
    ]
    
    #v(1em)
  ]
)

= Introduction

The field of research has seen significant advances in recent years. Previous work by Smith et al. @smith2023 established foundational principles that guide our approach.

In this paper, we present a novel methodology that addresses key limitations of existing approaches. Our contributions include:
- A new theoretical framework
- Improved algorithmic efficiency
- Extensive experimental validation

= Related Work

Previous research in this area can be categorized into several streams. Early work focused on fundamental problems @jones2022, while more recent approaches leverage modern techniques @chen2024.

== Theoretical Foundations

The theoretical underpinnings of our approach draw from established principles in the field.

== Practical Applications

Several practical implementations have demonstrated the viability of these concepts in real-world scenarios.

= Methodology

Our proposed approach consists of three main components:

== Problem Formulation

Let $X = {x_1, x_2, ..., x_n}$ denote the input set. We define the objective function as:

$ cal(L)(theta) = sum_(i=1)^n ell(f_theta (x_i), y_i) + lambda ||theta||_2^2 $

== Algorithm Design

The algorithm proceeds in iterative steps, optimizing the objective function through gradient descent.

== Implementation Details

We implement our method using standard frameworks, with careful attention to computational efficiency.

= Experiments

== Experimental Setup

We evaluate our method on three benchmark datasets. Table 1 summarizes the dataset characteristics.

#figure(
  table(
    columns: 4,
    stroke: 0.5pt,
    inset: 5pt,
    [*Dataset*], [*Samples*], [*Features*], [*Classes*],
    [Dataset A], [10,000], [256], [10],
    [Dataset B], [50,000], [512], [100],
    [Dataset C], [100,000], [1024], [1000],
  ),
  caption: [Dataset statistics],
)

== Results

Our method achieves significant improvements across all metrics.

= Conclusion

We have presented a novel approach that demonstrates strong performance. Future work will explore extensions to additional domains.

#bibliography("refs.bib", style: "ieee")
`
  },
  
  letter: {
    name: "letter.typ",
    content: `#set page(
  paper: "a4",
  margin: (x: 2.5cm, y: 2cm),
)

#set text(
  font: "New Computer Modern",
  size: 11pt,
)

#set par(
  justify: true,
  leading: 0.65em,
)

// Sender information
#align(right)[
  *Your Name* \\
  Your Address Line 1 \\
  City, State ZIP \\
  your.email\@example.com \\
  (555) 123-4567
]

#v(1.5cm)

// Date
#datetime.today().display("[month repr:long] [day], [year]")

#v(1cm)

// Recipient
*Recipient Name* \\
Title / Position \\
Organization Name \\
Street Address \\
City, State ZIP

#v(1cm)

// Salutation
Dear Mr./Ms. Recipient,

#v(0.5cm)

// Opening paragraph
I am writing to express my interest in the position / opportunity / matter regarding [subject]. Having researched your organization extensively, I am confident that my background and skills align well with your requirements.

// Body paragraphs
In my current role at [Previous Company], I have developed expertise in [relevant skills]. Some of my key accomplishments include:

- Successfully led a team of [number] professionals
- Increased efficiency by [percentage]%
- Implemented innovative solutions that resulted in [outcome]

I am particularly drawn to [Organization Name] because of your commitment to [specific aspect]. Your recent initiative on [project/program] resonates with my professional values and experience.

// Closing paragraph
I would welcome the opportunity to discuss how my experience and enthusiasm could benefit your team. I am available for an interview at your convenience and can be reached at the contact information provided above.

#v(0.5cm)

Thank you for considering my application. I look forward to the possibility of contributing to your organization's continued success.

#v(1cm)

// Closing
Sincerely,

#v(1.5cm)

*Your Name*

#v(0.5cm)

#text(size: 9pt, fill: gray)[
  Enclosures: Resume, References (if applicable)
]
`
  }
};

export type TemplateKey = keyof typeof templates;
