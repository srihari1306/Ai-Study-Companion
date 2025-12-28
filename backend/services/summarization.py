import ollama
import re
from typing import List, Dict, Tuple, Optional, Set
from dataclasses import dataclass
from collections import defaultdict

@dataclass
class SemanticSection:
    """Represents extracted semantic information from a section"""
    section_number: int
    heading: Optional[str]
    definitions: List[str]
    bullet_points: List[str]
    enumerations: List[str]
    formulas: List[str]
    algorithms: List[str]
    examples: List[str]
    conclusions: List[str]
    key_terms: List[str]
class SummarizationService:
    def __init__(self, model_name="qwen:7b"):
        self.model_name = model_name
        
        # Regex patterns for semantic extraction
        self.patterns = {
            'heading': re.compile(r'^#{1,6}\s+(.+)$|^([A-Z][^.!?]*):?\s*$', re.MULTILINE),
            'definition': re.compile(r'(?:is defined as|is a|refers to|means that|is the)\s+(.+?)(?:\.|$)', re.IGNORECASE),
            'bullet': re.compile(r'^[\s]*[-*•▪]\s+(.+)$', re.MULTILINE),
            'enumeration': re.compile(r'^\s*\d+[\.)]\s+(.+)$', re.MULTILINE),
            'formula': re.compile(r'[A-Z]\[?\w*\]?\s*[=<>≤≥]\s*.+|∑|∫|∏|\$[^$]+\$'),
            'algorithm': re.compile(r'(?:step|algorithm|procedure|process|method)[\s:]+(.+?)(?=\n\n|\Z)', re.IGNORECASE | re.DOTALL),
            'example': re.compile(r'(?:example|instance|for example|e\.g\.|such as)[:\s]+(.+?)(?=\n\n|\Z)', re.IGNORECASE | re.DOTALL),
            'conclusion': re.compile(r'(?:in conclusion|therefore|thus|hence|in summary|to summarize)[:\s]+(.+?)(?=\n\n|\Z)', re.IGNORECASE | re.DOTALL),
            'key_term': re.compile(r'\*\*(.+?)\*\*|__(.+?)__|"([^"]+)"(?=\s+is|\s+refers|\s+means)')
        }
        
        # Topic canonicalization rules
        self.topic_keywords = {
            'Data Visualization with ggplot2': ['ggplot', 'visualization', 'geom_', 'aes', 'plotting', 'graph'],
            'Data Transformation with dplyr': ['dplyr', 'filter', 'select', 'mutate', 'summarize', 'arrange', 'transform'],
            'Exploratory Data Analysis': ['eda', 'exploratory', 'variation', 'covariation', 'outlier', 'analysis'],
            'Tibbles': ['tibble', 'as_tibble', 'tribble'],
            'Data Import with readr': ['readr', 'read_csv', 'read_tsv', 'import', 'parse_'],
            'Tidy Data with tidyr': ['tidyr', 'gather', 'spread', 'separate', 'unite', 'tidy'],
            'Relational Data with dplyr': ['join', 'inner_join', 'left_join', 'right_join', 'full_join', 'relational'],
            'Strings with stringr': ['stringr', 'str_', 'string', 'regex', 'pattern'],
            'Factors with forcats': ['forcats', 'fct_', 'factor', 'categorical'],
            'Dates and Times with lubridate': ['lubridate', 'date', 'time', 'ymd', 'datetime'],
            'Pipes with magrittr': ['pipe', '%>%', 'magrittr'],
            'Functions': ['function', 'arguments', 'return'],
            'Vectors': ['vector', 'atomic', 'list', 'type'],
            'Iteration with purrr': ['purrr', 'map', 'iteration', 'apply'],
            'Model Basics': ['model', 'lm', 'predict', 'residual', 'linear'],
            'R Markdown': ['markdown', 'rmarkdown', 'knit', 'yaml'],
            'Graphics for Communication': ['communication', 'theme', 'labels', 'annotation']
        }
    
    def summarize_document(self, document, chunks):
        """
        Main entry point: Enhanced two-pass with topic grouping
        """
        print(f"[PASS 1] Extracting semantic structure from {len(chunks)} chunks...")
        
        # PASS 1: Information-preserving compression (NO LLM)
        semantic_skeleton = self._extract_semantic_skeleton(chunks)
        
        print(f"[PASS 2] Grouping by topics and validating coverage...")
        
        # NEW: Topic canonicalization and grouping
        topic_groups = self._group_by_topics(semantic_skeleton)
        
        # PASS 2: Coverage validation
        coverage_report = self._validate_coverage(semantic_skeleton, len(chunks), topic_groups)
        
        print(f"[PASS 3] Synthesizing with LLM (single call)...")
        
        # PASS 3: ONE global LLM call with structured topic outline
        final_summary = self._synthesize_summary(
            document, 
            topic_groups,
            coverage_report
        )
        
        print(f"[PASS 4] Post-processing cleanup...")
        
        # NEW: Post-synthesis cleanup
        final_summary = self._cleanup_output(final_summary)
        
        return final_summary
    
    def _extract_semantic_skeleton(self, chunks: List[str]) -> List[SemanticSection]:
        """
        PASS 1: Extract all information-dense elements WITHOUT paraphrasing
        Pure Python - no LLM calls - extremely fast
        """
        semantic_sections = []
        
        for idx, chunk in enumerate(chunks):
            section = SemanticSection(
                section_number=idx + 1,
                heading=None,
                definitions=[],
                bullet_points=[],
                enumerations=[],
                formulas=[],
                algorithms=[],
                examples=[],
                conclusions=[],
                key_terms=[]
            )
            
            # Extract heading (first significant line or markdown heading)
            heading_matches = self.patterns['heading'].findall(chunk[:500])
            if heading_matches:
                section.heading = next((h for h in heading_matches[0] if h), None)
                # Clean up heading - remove metadata
                if section.heading:
                    section.heading = self._clean_heading(section.heading)
            
            # Extract definitions
            def_matches = self.patterns['definition'].findall(chunk)
            section.definitions = [d.strip() for d in def_matches if d.strip()][:3]
            
            # Extract bullet points
            bullet_matches = self.patterns['bullet'].findall(chunk)
            section.bullet_points = [b.strip() for b in bullet_matches if b.strip()][:10]
            
            # Extract enumerations
            enum_matches = self.patterns['enumeration'].findall(chunk)
            section.enumerations = [e.strip() for e in enum_matches if e.strip()][:10]
            
            # Extract formulas
            formula_matches = self.patterns['formula'].findall(chunk)
            section.formulas = [f.strip() for f in formula_matches if f.strip()][:5]
            
            # Extract algorithms/procedures
            algo_matches = self.patterns['algorithm'].findall(chunk)
            section.algorithms = [a.strip()[:200] for a in algo_matches if a.strip()][:2]
            
            # Extract examples
            example_matches = self.patterns['example'].findall(chunk)
            section.examples = [ex.strip()[:300] for ex in example_matches if ex.strip()][:2]
            
            # Extract conclusions
            conclusion_matches = self.patterns['conclusion'].findall(chunk)
            section.conclusions = [c.strip()[:200] for c in conclusion_matches if c.strip()][:2]
            
            # Extract key terms (bolded or quoted terms)
            term_matches = self.patterns['key_term'].findall(chunk)
            section.key_terms = list(set([
                term for terms in term_matches 
                for term in terms if term and len(term) > 2
            ]))[:8]
            
            # If section has ANY content, include it
            if self._section_has_content(section):
                semantic_sections.append(section)
        
        return semantic_sections
    
    def _clean_heading(self, heading: str) -> str:
        """Remove metadata and noise from headings"""
        # Remove common metadata patterns
        heading = re.sub(r'AD\d+\s*[–-]\s*', '', heading)
        heading = re.sub(r'UNIT\s+[IVX]+\s*[–-]\s*', '', heading, flags=re.IGNORECASE)
        heading = re.sub(r'\d+\s*\|\s*P\s*a\s*g\s*e', '', heading)
        
        # Remove excessive repetition
        words = heading.split()
        if len(words) > 20:  # If heading is suspiciously long
            heading = ' '.join(words[:10])  # Take first 10 words
        
        return heading.strip()
    
    def _group_by_topics(self, semantic_sections: List[SemanticSection]) -> Dict[str, List[SemanticSection]]:
        """
        NEW: Group semantic sections by canonical topics
        No LLM - keyword matching
        """
        topic_groups = defaultdict(list)
        
        for section in semantic_sections:
            # Combine all text from section for keyword matching
            section_text = ' '.join([
                section.heading or '',
                ' '.join(section.definitions),
                ' '.join(section.bullet_points),
                ' '.join(section.key_terms)
            ]).lower()
            
            # Find matching topic
            matched_topic = None
            max_matches = 0
            
            for topic, keywords in self.topic_keywords.items():
                matches = sum(1 for kw in keywords if kw.lower() in section_text)
                if matches > max_matches:
                    max_matches = matches
                    matched_topic = topic
            
            # Assign to topic or general category
            if matched_topic and max_matches > 0:
                topic_groups[matched_topic].append(section)
            else:
                topic_groups['General Concepts'].append(section)
        
        return dict(topic_groups)
    
    def _section_has_content(self, section: SemanticSection) -> bool:
        """Check if section contains any extracted information"""
        return any([
            section.heading,
            section.definitions,
            section.bullet_points,
            section.enumerations,
            section.formulas,
            section.algorithms,
            section.examples,
            section.conclusions,
            section.key_terms
        ])
    
    def _validate_coverage(self, semantic_sections: List[SemanticSection], 
                          total_chunks: int, topic_groups: Dict) -> Dict:
        """
        PASS 2: Validate that we have full coverage
        No LLM - pure analysis
        """
        sections_with_content = len(semantic_sections)
        sections_with_definitions = sum(1 for s in semantic_sections if s.definitions)
        sections_with_structure = sum(1 for s in semantic_sections 
                                     if s.bullet_points or s.enumerations)
        total_items_extracted = sum([
            len(s.definitions) + len(s.bullet_points) + len(s.enumerations) +
            len(s.formulas) + len(s.algorithms) + len(s.examples) + 
            len(s.conclusions) + len(s.key_terms)
            for s in semantic_sections
        ])
        
        coverage_quality = "Excellent" if sections_with_content >= total_chunks * 0.9 else \
                          "Good" if sections_with_content >= total_chunks * 0.7 else "Moderate"
        
        return {
            'total_chunks': total_chunks,
            'sections_extracted': sections_with_content,
            'coverage_percentage': round((sections_with_content / total_chunks) * 100, 1),
            'sections_with_definitions': sections_with_definitions,
            'sections_with_structure': sections_with_structure,
            'total_items_extracted': total_items_extracted,
            'coverage_quality': coverage_quality,
            'topics_identified': len(topic_groups)
        }
    
    def _format_topic_outline(self, topic_groups: Dict[str, List[SemanticSection]]) -> str:
        """
        NEW: Format semantic skeleton grouped by topics
        This gives LLM clear structure to follow
        """
        outline_parts = []
        
        for topic, sections in topic_groups.items():
            topic_text = f"\n{'='*60}\n[TOPIC: {topic}]\n{'='*60}"
            
            # Aggregate all content for this topic
            all_definitions = []
            all_formulas = []
            all_key_points = []
            all_examples = []
            all_terms = set()
            
            for section in sections:
                all_definitions.extend(section.definitions)
                all_formulas.extend(section.formulas)
                all_key_points.extend(section.bullet_points[:3])  # Top 3 per section
                all_examples.extend(section.examples)
                all_terms.update(section.key_terms)
            
            # Format topic content
            if all_definitions:
                topic_text += "\n\nDefinitions:"
                for d in all_definitions[:5]:  # Top 5 definitions
                    topic_text += f"\n  - {d}"
            
            if all_formulas:
                topic_text += "\n\nFormulas/Syntax:"
                for f in all_formulas[:5]:
                    topic_text += f"\n  - {f}"
            
            if all_key_points:
                topic_text += "\n\nKey Concepts:"
                for kp in all_key_points[:8]:  # Top 8 key points
                    topic_text += f"\n  - {kp}"
            
            if all_examples:
                topic_text += "\n\nExamples:"
                for ex in all_examples[:3]:  # Top 3 examples
                    topic_text += f"\n  - {ex[:150]}..."  # Truncate long examples
            
            if all_terms:
                topic_text += f"\n\nKey Terms: {', '.join(list(all_terms)[:10])}"
            
            outline_parts.append(topic_text)
        
        return '\n\n'.join(outline_parts)
    
    def _synthesize_summary(self, document, topic_groups: Dict[str, List[SemanticSection]],
                           coverage_report: Dict) -> Dict:
        """
        PASS 3: Single high-quality LLM call with teaching-style focus
        """
        topic_outline = self._format_topic_outline(topic_groups)
        
        # Ensure token efficiency
        if len(topic_outline) > 7000:
            topic_outline = topic_outline[:7000] + "\n\n[Additional content truncated for token efficiency]"
        
        prompt = f"""You are an expert educator creating exam-ready study materials. You will receive a STRUCTURED TOPIC OUTLINE of a document.

**CRITICAL CONTEXT**:
- This is for students preparing for DATA SCIENCE exams (4, 8, and 16 mark questions)
- Students need to understand WHAT concepts are, WHY they're used, and HOW to apply them
- Focus on teaching, not just listing

**Document**: {document.filename}
**Topics Identified**: {coverage_report['topics_identified']} major topics
**Coverage**: {coverage_report['coverage_percentage']}% of document analyzed
**Items Extracted**: {coverage_report['total_items_extracted']} information items

**STRUCTURED TOPIC OUTLINE**:
{topic_outline}

**YOUR TASK - Create an exam-ready study guide with:**

## 📋 Executive Summary
[3-4 sentences: What is this document about? What will students learn? Why does it matter for data science?]

## 🎯 Main Topics Covered
[List each major topic as a clear, scannable bullet. Format: "- Topic Name: One-line description of what it covers"]

## 📚 Detailed Topic Explanations

[For EACH topic in the outline above, create a subsection following this teaching structure:]

### [Topic Name]

**What it is**: [1-2 sentence definition in plain language]

**Why it's used**: [1-2 sentences on the purpose and use cases]

**Key concepts and functions**:
- [Concept 1]: Brief explanation
- [Concept 2]: Brief explanation
- [Function/Tool]: What it does

**Example**:
[Provide a clear, concrete example if available in the outline]

**Important for exams**: [What students must remember about this topic]

[Repeat this structure for ALL topics in the outline]

## 💡 Key Takeaways for Exams
[5-7 critical points students MUST remember. Focus on concepts likely to appear in exams]

## 🔑 Important Terms & Definitions
[List and define all key terms. Format: "**Term**: Clear definition"]

## 📐 Essential Formulas & Syntax
[List all important formulas, functions, and syntax patterns with brief explanations]

## ❓ Practice Questions
[Create 5 exam-style questions testing understanding:
- 2 definition/concept questions (4 marks each)
- 2 application questions (8 marks each)  
- 1 comprehensive question (16 marks)]

## 📊 Coverage Disclosure
This summary represents {coverage_report['coverage_percentage']}% structural coverage, analyzing {coverage_report['sections_extracted']} sections and extracting {coverage_report['total_items_extracted']} key information items including definitions, concepts, and examples.

**IMPORTANT CONSTRAINTS**:
- Write for exam preparation, not just reference
- Each topic must have: definition, purpose, key concepts, and example
- Use clear headers and bullet points for scannability
- Be comprehensive but concise - students need to memorize this
- NO invented content - only use information from the outline provided

Create the complete exam-ready study guide now:"""

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.7,
                    "top_p": 0.9,
                    "num_predict": 3500,
                    "num_ctx": 8192
                }
            )
            
            summary_text = response['response']
            
            # Extract structured elements
            key_points = self._extract_key_points(summary_text)
            topics = self._extract_topics(summary_text)
            formulas = self._extract_formulas_from_summary(summary_text)
            terms = self._extract_terms_from_summary(summary_text)
            
            # Calculate word count
            total_word_count = sum([
                len(' '.join(s.definitions + s.bullet_points + s.enumerations + 
                            s.algorithms + s.examples + s.conclusions).split())
                for sections in topic_groups.values()
                for s in sections
            ])
            
            return {
                'summary': summary_text,
                'key_points': key_points,
                'topics': topics,
                'formulas': formulas,
                'important_terms': terms,
                'word_count': total_word_count,
                'chunk_count': coverage_report['total_chunks'],
                'coverage_report': coverage_report,
                'extraction_stats': {
                    'total_sections': coverage_report['sections_extracted'],
                    'total_items': coverage_report['total_items_extracted'],
                    'definitions_found': coverage_report['sections_with_definitions'],
                    'structured_sections': coverage_report['sections_with_structure'],
                    'topics_identified': coverage_report['topics_identified']
                }
            }
            
        except Exception as e:
            print(f"Error in LLM synthesis: {e}")
            return self._generate_fallback_summary(document, topic_groups, coverage_report)
    
    def _cleanup_output(self, summary_dict: Dict) -> Dict:
        """
        NEW: Post-synthesis cleanup pass (NO LLM)
        Removes formatting issues and noise
        """
        summary_text = summary_dict['summary']
        
        # Remove duplicate consecutive lines
        lines = summary_text.split('\n')
        cleaned_lines = []
        prev_line = ""
        
        for line in lines:
            line_clean = line.strip()
            # Skip if identical to previous line
            if line_clean != prev_line or line_clean.startswith('#'):
                cleaned_lines.append(line)
            prev_line = line_clean
        
        # Remove metadata-only bullets
        cleaned_lines = [
            line for line in cleaned_lines 
            if not re.match(r'^\s*[-*]\s*AD\d+', line) and
               not re.match(r'^\s*[-*]\s*UNIT\s+[IVX]+', line)
        ]
        
        summary_dict['summary'] = '\n'.join(cleaned_lines)
        
        # Clean up topics list
        if 'topics' in summary_dict:
            summary_dict['topics'] = [
                self._clean_heading(t) for t in summary_dict['topics']
                if len(t) < 100  # Remove suspiciously long "topics"
            ]
        
        return summary_dict
    
    def _extract_key_points(self, summary_text: str) -> List[str]:
        """Extract key takeaways from summary"""
        key_points = []
        
        takeaways_match = re.search(r'## 💡 Key Takeaways.*?$(.*?)(?=##|\Z)', 
                                   summary_text, re.DOTALL | re.MULTILINE)
        
        if takeaways_match:
            takeaways_section = takeaways_match.group(1)
            points = re.findall(r'[-*]\s+(.+)', takeaways_section)
            key_points = [p.strip() for p in points if p.strip() and len(p) < 200]
        
        return key_points[:7]
    
    def _extract_topics(self, summary_text: str) -> List[str]:
        """Extract main topics from summary"""
        topics = []
        
        topics_match = re.search(r'## 🎯 Main Topics.*?$(.*?)(?=##|\Z)', 
                                summary_text, re.DOTALL | re.MULTILINE)
        
        if topics_match:
            topics_section = topics_match.group(1)
            topic_items = re.findall(r'[-*]\s+(.+?)(?::|$)', topics_section)
            topics = [t.strip() for t in topic_items if t.strip() and len(t) < 100]
        
        return topics
    
    def _extract_formulas_from_summary(self, summary_text: str) -> List[str]:
        """Extract formulas section"""
        formulas = []
        
        formulas_match = re.search(r'## 📐 Essential.*?$(.*?)(?=##|\Z)', 
                                  summary_text, re.DOTALL | re.MULTILINE)
        
        if formulas_match:
            formulas_section = formulas_match.group(1)
            formula_items = re.findall(r'[-*]\s+(.+)', formulas_section)
            formulas = [f.strip() for f in formula_items if f.strip()]
        
        return formulas
    
    def _extract_terms_from_summary(self, summary_text: str) -> List[str]:
        """Extract important terms"""
        terms = []
        
        terms_match = re.search(r'## 🔑 Important Terms.*?$(.*?)(?=##|\Z)', 
                               summary_text, re.DOTALL | re.MULTILINE)
        
        if terms_match:
            terms_section = terms_match.group(1)
            term_items = re.findall(r'[-*]\s*\*\*(.+?)\*\*', terms_section)
            terms = [t.strip() for t in term_items if t.strip()]
        
        return terms
    
    def _generate_fallback_summary(self, document, topic_groups: Dict[str, List[SemanticSection]],
                                  coverage_report: Dict) -> Dict:
        """Generate fallback if LLM synthesis fails"""
        
        topics = list(topic_groups.keys())
        
        summary = f"""## 📋 Document Summary

**File**: {document.filename}
**Topics Identified**: {len(topics)}
**Coverage**: {coverage_report['coverage_percentage']}%

## 🎯 Main Topics Covered

{chr(10).join([f'- {topic}' for topic in topics])}

## 📚 Content Overview

This document covers {len(topics)} major topics in Data Science with R. All sections have been analyzed and key concepts extracted.

## 💡 Key Takeaways
- Review each topic systematically
- Focus on definitions and key functions
- Practice with examples provided
- Use this as an exam preparation guide

## 📊 Coverage Report
Analyzed {coverage_report['sections_extracted']} sections, extracting {coverage_report['total_items_extracted']} information items across {len(topics)} topics.
"""
        
        total_word_count = sum([
            len(' '.join(s.definitions + s.bullet_points).split())
            for sections in topic_groups.values()
            for s in sections
        ])
        
        return {
            'summary': summary,
            'key_points': ['Review systematically', 'Focus on key concepts', 'Practice examples'],
            'topics': topics,
            'formulas': [],
            'important_terms': [],
            'word_count': total_word_count,
            'chunk_count': coverage_report['total_chunks'],
            'coverage_report': coverage_report
        }
    
    def generate_quick_summary(self, text: str, max_words: int = 150) -> str:
        """Generate a quick summary for short text"""
        
        if len(text) > 3000:
            text = text[:3000]
        
        prompt = f"""Summarize the following text in {max_words} words or less. Focus on the main concepts and key information.

Text:
{text}

Summary:"""

        try:
            response = ollama.generate(
                model=self.model_name,
                prompt=prompt,
                options={
                    "temperature": 0.5,
                    "num_predict": 200
                }
            )
            
            return response['response'].strip()
            
        except Exception as e:
            print(f"Error generating quick summary: {e}")
            return "Summary generation failed. Please try again."