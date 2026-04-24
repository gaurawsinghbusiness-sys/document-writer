/**
 * Pro Book Editor - Sections Module
 * Pre-built section templates for books
 */

const Sections = {
    init() {
        this.setupEvents();
    },

    setupEvents() {
        // Section list in sidebar
        const sectionList = document.getElementById('sectionList');
        if (sectionList) {
            sectionList.addEventListener('click', (e) => {
                const item = e.target.closest('.section-item');
                if (item) {
                    const type = item.dataset.type;
                    Editor.insertSection(type);
                }
            });
        }

        // Quick insert buttons
        document.querySelectorAll('.insert-btn[data-insert]').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.insert;
                Editor.insertSection(type);
            });
        });
    },

    // Get section templates
    getTemplates() {
        const title = AppState.document.title || 'Untitled Book';
        const author = AppState.document.author || 'Author Name';
        const year = new Date().getFullYear();
        const date = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' }).format(new Date());

        return {
            // Book front matter
            'title-page': () => `
                <div style="text-align:center;margin-top:3in">
                    <h1 style="font-size:28pt;margin-bottom:0.5em">${title}</h1>
                    <p style="font-size:14pt;font-style:italic">by ${author}</p>
                </div>
            `,

            'half-title': () => `
                <div style="text-align:center;margin-top:4in">
                    <h1 style="font-size:24pt">${title}</h1>
                </div>
            `,

            'dedication': () => `
                <div style="text-align:center;margin-top:3in">
                    <p style="font-style:italic;font-size:14pt">
                        To those who believed in me<br>
                        when I didn't believe in myself...
                    </p>
                </div>
            `,

            'copyright': () => `
                <div style="margin-top:4in;text-align:center;font-size:10pt">
                    <p>Copyright © ${year} ${author}</p>
                    <p style="margin-top:1em">All rights reserved. No part of this publication may be reproduced, 
                    distributed, or transmitted in any form or by any means without prior written permission.</p>
                    <p style="margin-top:1em">ISBN: 000-0-00-000000-0</p>
                    <p style="margin-top:1em">First Edition</p>
                </div>
            `,

            'epigraph': () => `
                <div style="margin-top:3in;margin-left:2in;margin-right:1in">
                    <p style="font-style:italic">"Insert a meaningful quote here that sets the tone for your book."</p>
                    <p style="text-align:right;margin-top:0.5em">— Author Name</p>
                </div>
            `,

            'toc': () => `
                <h2 style="text-align:center;margin-bottom:2em">Table of Contents</h2>
                <div style="line-height:2">
                    <p>Chapter 1: The Beginning ..................... 1</p>
                    <p>Chapter 2: The Journey ...................... 15</p>
                    <p>Chapter 3: The Challenge .................... 35</p>
                    <p>Chapter 4: The Resolution ................... 55</p>
                </div>
            `,

            'preface': () => `
                <h2 style="text-align:center">Preface</h2>
                <p style="margin-top:2em">Write your preface here. Explain why you wrote this book, what inspired you, and what readers can expect...</p>
            `,

            'acknowledgments': () => `
                <h2 style="text-align:center">Acknowledgments</h2>
                <p style="margin-top:2em">I would like to thank the following people who made this book possible...</p>
            `,

            // Chapters and content
            'chapter': () => {
                const num = AppState.runtime.chapterNum++;
                return `
                    <h2 style="text-align:center;margin-top:2in;margin-bottom:2em">Chapter ${num}</h2>
                    <p>Begin your chapter here...</p>
                `;
            },

            'prologue': () => `
                <h2 style="text-align:center;margin-top:2in;text-transform:uppercase;letter-spacing:0.1em">Prologue</h2>
                <p style="margin-top:2em">The story begins before the story begins...</p>
            `,

            'epilogue': () => `
                <h2 style="text-align:center;margin-top:2in;text-transform:uppercase;letter-spacing:0.1em">Epilogue</h2>
                <p style="margin-top:2em">After the story ends...</p>
            `,

            // Back matter
            'about': () => `
                <h2 style="text-align:center">About the Author</h2>
                <p style="margin-top:2em">${author} is a writer who lives in [City]. When not writing, they enjoy [hobbies]. This is their [first/second/etc.] book.</p>
                <p style="margin-top:1em">Connect with the author:</p>
                <ul>
                    <li>Website: www.example.com</li>
                    <li>Twitter: @author</li>
                </ul>
            `,

            'also-by': () => `
                <h2 style="text-align:center">Also by ${author}</h2>
                <div style="text-align:center;margin-top:2em">
                    <p style="font-style:italic">Book Title One</p>
                    <p style="font-style:italic">Book Title Two</p>
                    <p style="font-style:italic">Book Title Three</p>
                </div>
            `,

            // Utility
            'pagebreak': () => `
                <div style="page-break-after:always;border-top:2px dashed var(--border);margin:2em 0;padding:1em;text-align:center">
                    <span style="color:var(--text-muted);font-size:0.8em">— Page Break —</span>
                </div>
            `,

            'scene-break': () => `
                <div style="text-align:center;margin:2em 0">
                    <span style="letter-spacing:0.5em">* * *</span>
                </div>
            `,

            'image': () => `
                <div style="text-align:center;padding:3em;border:2px dashed var(--border);border-radius:8px;margin:1em 0">
                    <p style="color:var(--text-muted)">[Insert Image Here]</p>
                    <p style="color:var(--text-muted);font-size:0.8em">Drag and drop or click to upload</p>
                </div>
            `,

            'quote': () => `
                <blockquote style="margin:1.5em 2em;padding:1em 1.5em;border-left:4px solid var(--accent);font-style:italic;background:rgba(0,0,0,0.03)">
                    "Your quote here..."
                    <footer style="margin-top:0.5em;font-style:normal;font-size:0.9em">— Source</footer>
                </blockquote>
            `,

            // Non-fiction sections
            'executive-summary': () => `
                <h2>Executive Summary</h2>
                <p style="margin-top:1em">Provide a brief overview of the key points...</p>
            `,

            'introduction': () => `
                <h2>Introduction</h2>
                <p style="margin-top:1em">Introduce the topic and set expectations...</p>
            `,

            'conclusion': () => `
                <h2>Conclusion</h2>
                <p style="margin-top:1em">Summarize the key findings and recommendations...</p>
            `,

            'references': () => `
                <h2>References</h2>
                <ol style="margin-top:1em">
                    <li>Author, A. (Year). Title of work. Publisher.</li>
                    <li>Author, B. (Year). Title of article. Journal Name, Volume(Issue), pages.</li>
                </ol>
            `,

            'glossary': () => `
                <h2>Glossary</h2>
                <dl style="margin-top:1em">
                    <dt><strong>Term 1</strong></dt>
                    <dd>Definition of term 1...</dd>
                    <dt style="margin-top:1em"><strong>Term 2</strong></dt>
                    <dd>Definition of term 2...</dd>
                </dl>
            `,

            'index': () => `
                <h2>Index</h2>
                <div style="column-count:2;margin-top:1em;font-size:0.9em">
                    <p>Topic A, 1, 5, 12</p>
                    <p>Topic B, 3, 8, 15</p>
                    <p>Topic C, 7, 22, 45</p>
                </div>
            `
        };
    },

    // Get section info
    getSectionInfo() {
        return [
            { type: 'title-page', icon: '📄', label: 'Title Page' },
            { type: 'dedication', icon: '💝', label: 'Dedication' },
            { type: 'copyright', icon: '©️', label: 'Copyright' },
            { type: 'toc', icon: '📑', label: 'Contents' },
            { type: 'preface', icon: '📝', label: 'Preface' },
            { type: 'chapter', icon: '📖', label: 'Chapter' },
            { type: 'about', icon: '👤', label: 'About Author' },
            { type: 'pagebreak', icon: '📃', label: 'Page Break' },
            { type: 'scene-break', icon: '✦', label: 'Scene Break' },
            { type: 'image', icon: '🖼️', label: 'Image' },
            { type: 'quote', icon: '💬', label: 'Quote' }
        ];
    }
};

window.Sections = Sections;
