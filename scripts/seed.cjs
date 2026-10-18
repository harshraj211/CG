const fs=require('node:fs');
fs.mkdirSync('data',{recursive:true});
const write=(name,data)=>fs.writeFileSync(`data/${name}.json`,JSON.stringify(data,null,2));
// Original concept cards: name | explanation | example | misconception.
const banks={
'AI Literacy':[
['Artificial intelligence','Systems performing tasks that require reasoning, perception or decision making','A route planner chooses a path under constraints','AI always requires neural networks'],
['Machine learning','Learning patterns from data instead of explicitly coding every decision','A spam classifier learns from labelled emails','Every decision is a manually written rule'],
['Deep learning','Machine learning with multilayer neural networks','A convolutional network identifies defects in images','Deep learning cannot process images'],
['Generative AI','Models creating new content from learned distributions','A model drafts a summary of a document','Generative models only classify existing labels'],
['Large language models','Models predicting and generating sequences of tokens','A model completes a partially written paragraph','LLMs are guaranteed factual databases'],
['Tokens','Units of text processed by a language model','One word can be split into several subword tokens','Every word is always exactly one token'],
['Embeddings','Numeric vectors representing semantic features','Similar sentences can have nearby vectors','Embeddings are encrypted original text'],
['Transformers','Neural architectures using attention to relate sequence elements','A model relates a pronoun to an earlier noun','Transformers require recurrence for every token'],
['Attention','A mechanism weighting relevant parts of an input','A translation model focuses on relevant source words','Attention assigns equal weight to every input'],
['Prompt engineering','Designing instructions, context and output requirements','Specify audience, constraints and JSON output','A longer prompt is always a better prompt'],
['Hallucination','A plausible generated claim unsupported by evidence','A model invents a journal citation','Fluent writing guarantees truth'],
['Fine-tuning','Updating model parameters with additional training examples','Adapt a model to a domain-specific classification task','Fine-tuning is simply adding text to a prompt'],
['Inference','Using a trained model to produce predictions','Classify a newly received email','Inference always updates model weights'],
['Context window','The bounded token capacity available for a request','Long conversation history may need truncation','A model remembers unlimited prior text'],
['Vector databases','Stores supporting similarity retrieval over embeddings','Retrieve product documents closest to a query vector','Vector retrieval is always exact keyword matching'],
['RAG','Retrieval augmented generation supplies retrieved evidence to a model','Retrieve policy paragraphs before answering a policy question','RAG requires retraining model weights'],
['Agents','Systems that choose actions and tools toward a goal','An assistant searches documents then checks a calendar','An agent needs unrestricted permissions'],
['AI safety','Controls reducing harmful or unintended model behaviour','Require approval before a tool deletes a record','Safety can be guaranteed by a single prompt'],
['AI ethics','Responsible handling of fairness, transparency and accountability','Audit unequal error rates across groups','Accuracy alone resolves all ethical concerns'],
['Supervised learning','Learning from examples paired with target labels','Train on transactions marked fraudulent or legitimate','Supervised learning has no labels'],
['Unsupervised learning','Finding structure in data without target labels','Cluster customers by purchasing patterns','Clustering needs a correct class for each sample'],
['Classification','Predicting a discrete category','Predict whether an email is spam','Classification always outputs a continuous price'],
['Regression','Predicting a numeric target','Estimate a house price','Regression only returns categories'],
['Training and validation','Validation estimates performance outside training examples','Tune a model on validation data then evaluate on held-out tests','Test data should be used repeatedly for tuning'],
['Overfitting','Learning training-specific noise that fails to generalize','Training accuracy is high but validation accuracy falls','Perfect training accuracy guarantees deployment quality'],
['Data leakage','Training uses information unavailable at prediction time','A future payment status leaks into a credit-risk feature','Leakage makes real-world evaluation more reliable'],
['Precision','The fraction of predicted positives that are actually positive','Reduce false fraud alerts when review capacity is limited','Precision is the fraction of all positives recovered'],
['Recall','The fraction of actual positives successfully detected','Prioritize detecting diseases even with extra follow-up tests','High recall implies there are no false positives'],
['Temperature','A sampling control affecting output variability','Use a lower temperature for more consistent extraction','Temperature guarantees factual correctness'],
['Few-shot prompting','Showing examples of the desired task and format','Provide two labelled extraction examples in the prompt','Few-shot examples permanently train the model'],
['System instructions','Application-level instructions for model behaviour','Set a tutoring policy before candidate input','User text should be allowed to override all safety rules'],
['Prompt injection','Untrusted content tries to override trusted instructions','A retrieved page says to ignore the developer instructions','Retrieved documents are always trusted instructions'],
['Retrieval loaders','Components reading source data into document records','Load a PDF with page metadata','A loader automatically verifies every source claim'],
['Chunking','Splitting documents into retrieval units','Split a handbook into overlapping sections','One entire corpus should always be a single chunk'],
['Recursive splitting','Splitting progressively by section, paragraph and smaller boundaries','Try paragraph breaks before splitting individual sentences','Recursive splitting is identical to random splitting'],
['Semantic splitting','Grouping text based on meaning changes','Start a new chunk when the discussion changes topic','Semantic splitting always uses a fixed character count'],
['Chunk overlap','Repeating some boundary content to preserve context','Repeat a preceding sentence in the next chunk','Overlap has no storage or token cost'],
['Cosine similarity','Measures alignment of two vectors independent of magnitude','Compare normalized query and document directions','A higher cosine score proves a source is factually true'],
['Top-K retrieval','Returning a limited number of nearest candidates','Fetch five relevant chunks for an answer','Larger K always improves quality without cost'],
['Retriever','Selects evidence for a query from an indexed corpus','Apply a policy-year filter before vector search','The retriever must write the final natural-language answer'],
['Prompt construction','Combining instructions, query and clearly delimited evidence','Tell the model to cite supplied passages and admit missing evidence','Retrieved content should be treated as new system instructions'],
['Reranking','Reordering initial candidates using a more precise relevance model','Score query-document pairs after broad vector retrieval','Reranking must happen before any candidates are retrieved'],
['Metadata filtering','Restricting search using structured document attributes','Only retrieve records accessible to the current department','Similarity search automatically enforces access control'],
['Hybrid search','Combining lexical and semantic retrieval','Use keywords for an exact product code and vectors for intent','Hybrid search excludes keyword search'],
['RAG evaluation','Assessing retrieval relevance and grounded answer quality','Measure retrieval recall and answer faithfulness separately','Only grammar quality matters for a RAG system'],
['Grounded generation','Supporting generated claims with supplied evidence','Answer with a cited policy section or abstain','RAG completely eliminates hallucinations'],
['Embedding consistency','Index and query vectors must use compatible embedding spaces','Re-embed documents when switching embedding models','Vectors from unrelated embedding models are interchangeable'],
['Index freshness','An index needs updates when source documents change','Refresh a handbook index after a policy revision','RAG indexes stay current without an update process'],
['Retrieval access control','Authorization must constrain evidence retrieval','Filter restricted records before constructing model context','Hiding a final citation is sufficient protection'],
['Tool calling','Models request structured actions which the application validates','Validate arguments before invoking a database lookup','A model tool call is automatically safe to execute']
],
DBMS:[
['DBMS vs RDBMS','An RDBMS organizes relations with relational constraints','Represent customers and orders in linked tables','Every DBMS must store only relational tables'],
['Primary key','Uniquely identifies each row and cannot be null','A customer_id identifies a customer record','A primary key may contain duplicate values'],
['Foreign key','References a candidate key to maintain referential integrity','An order customer_id references a customer','A foreign key must be unique in the child table'],
['Candidate key','A minimal set of attributes uniquely identifying a row','Both employee_id and a unique email can be candidates','A candidate key may include redundant attributes'],
['First normal form','Each attribute holds an atomic value relative to its domain','Store each phone number in a separate related row','Comma-separated repeating phone fields always satisfy 1NF'],
['Second normal form','1NF with no partial dependency on a candidate key','Move a product name out of a composite order-item key table','2NF allows dependency on only part of a composite key'],
['Third normal form','For every dependency X to A, X is a superkey or A is prime','Separate department details from employee details','3NF always permits transitive dependencies on non-key attributes'],
['BCNF','Every determinant in a nontrivial dependency is a superkey','Decompose a relation whose non-key tutor determines a subject','BCNF is weaker than third normal form'],
['Atomicity','A transaction completes entirely or rolls back','Both debit and credit succeed in a transfer','Atomicity permits a partially committed transfer'],
['Consistency','A transaction preserves defined integrity constraints','A balance check prevents invalid negative balances','Consistency means all replicas are instantly identical'],
['Isolation','Concurrent transactions follow an isolation contract','A serializable schedule behaves like a serial order','Isolation means no transactions can ever run concurrently'],
['Durability','Committed changes survive supported failures','Recover committed orders after a restart','Committed data exists only in volatile memory'],
['Clustered index','Defines row storage ordering or clustering in an engine-specific way','Range scans can benefit from clustered key locality','A table can have unlimited independent physical row orders'],
['Non-clustered index','Separate search structure pointing to underlying rows','Look up an employee by an indexed email','An index makes every write operation cheaper'],
['Joins','Combine related rows based on a condition','Join invoices to customers using customer_id','A join always removes unmatched rows'],
['Views','Named queries exposing a derived representation','Expose selected columns to reporting users','Every ordinary view stores a separate physical copy'],
['Stored procedures','Named server-side routines containing database logic','A routine applies a sequence of validated updates','Stored procedures inherently prevent all injection'],
['Triggers','Routines invoked by configured database events','Write an audit row after an update','Triggers execute only when manually called by name'],
['Deadlocks','Transactions form a cycle of mutually waiting locks','Transaction A holds X while B holds Y and both request the other','A deadlock is the same as a single long query'],
['Isolation levels','Trade-offs controlling allowed concurrent-read anomalies','Read committed avoids dirty reads but may allow nonrepeatable reads','Read committed prevents every phantom under every engine']
],
SQL:[
['SELECT','Projects expressions or columns from matching rows','SELECT name FROM employees','SELECT always changes stored rows'],
['WHERE','Filters individual rows before grouping','WHERE salary > 50000','WHERE filters aggregate groups after GROUP BY'],
['GROUP BY','Forms groups sharing grouping expressions','GROUP BY department','GROUP BY guarantees sorted output'],
['HAVING','Filters aggregate groups','HAVING COUNT(*) > 3','HAVING must always execute before WHERE'],
['ORDER BY','Defines result ordering','ORDER BY salary DESC, id ASC','Rows have guaranteed order without ORDER BY'],
['INNER JOIN','Returns rows matching the join condition on both sides','Join orders to existing customers','An inner join always preserves every left row'],
['LEFT JOIN','Preserves left rows and null-extends unmatched right columns','List all customers even those without orders','Filtering right columns in WHERE always preserves unmatched left rows'],
['RIGHT JOIN','Preserves right rows and null-extends unmatched left columns','Keep all right-table departments','RIGHT JOIN is identical to INNER JOIN for unmatched rows'],
['SELF JOIN','Joins two aliases of the same relation','Link employees to managers in the employees table','A self join requires two different physical tables'],
['Subqueries','Queries nested within another SQL expression','Filter salaries above SELECT AVG(salary)','A scalar subquery may return arbitrary multiple rows'],
['CTE','A named query expression scoped to a statement','WITH totals AS (...) SELECT * FROM totals','Every CTE is automatically a permanent table'],
['Window functions','Calculate across related rows without collapsing each output row','SUM(amount) OVER (PARTITION BY customer_id)','Window functions always reduce each partition to one row'],
['COUNT','COUNT(*) counts rows while COUNT(column) excludes nulls','COUNT(email) ignores missing emails','COUNT(column) always includes null values'],
['SUM and AVG','Aggregate numeric values while ignoring null inputs','AVG(score) ignores absent scores','AVG treats every null as zero'],
['MAX and MIN','Return extreme non-null values','MAX(salary) returns the largest known salary','MAX always returns the row containing all associated columns'],
['DISTINCT','Removes duplicate result tuples','SELECT DISTINCT city FROM customers','DISTINCT applies only to the first selected column'],
['NULL comparisons','Use IS NULL instead of equality to detect nulls','WHERE manager_id IS NULL','NULL = NULL evaluates to true in ordinary SQL'],
['UNION','Combines result sets removing duplicates unless UNION ALL is used','Combine active and archived customer IDs','UNION ALL removes duplicates'],
['Ranking functions','ROW_NUMBER assigns distinct positions while RANK leaves gaps on ties','Scores 90,90,80 receive RANK values 1,1,3','RANK and DENSE_RANK always produce identical ranks'],
['Index-aware predicates','Search-friendly predicates can permit useful index access','A direct timestamp range can use a timestamp index','Wrapping an indexed column in a function always preserves index seeks']
],
OOP:[
['Classes and objects','A class defines structure and behaviour while an object is an instance','Two account objects share a class but have separate balances','All instances always share every field value'],
['Encapsulation','Controls access to state through defined interfaces','Validate balance changes in a deposit method','Public access to every mutable field guarantees encapsulation'],
['Inheritance','A subtype derives behaviour from a parent type','A specialized account inherits account operations','Inheritance always makes composition unnecessary'],
['Polymorphism','A common interface supports different implementations','Call draw on different shape objects','Polymorphism requires all methods to have identical bodies'],
['Abstraction','Exposes relevant operations while hiding implementation details','A payment interface hides provider-specific request logic','Abstraction means every detail must be publicly visible'],
['Overriding','A subtype supplies an implementation of an inherited method','A savings account overrides interest calculation','Overriding is adding an unrelated method name'],
['Overloading','Methods share a name but have distinguishable signatures in supporting languages','Java methods accept either an int or a String','Changing only the return type permits Java overloads'],
['Constructors','Initialize a new instance according to language rules','Set required fields when creating an account','A constructor is an ordinary Java method with a return type'],
['Interfaces','Specify a contract implemented by compatible types','Different storage providers implement a save contract','An interface forces every implementation to use the same algorithm'],
['Abstract classes','Can define shared implementation and abstract operations','A base report defines common formatting and abstract data loading','An abstract class is directly instantiable in Java'],
['Static members','Belong to a class rather than a particular instance','A shared factory method creates instances','A static Java method can directly use this'],
['Composition','Builds behaviour by containing or delegating to components','A car has an engine rather than being an engine','Has-a relationships always require inheritance'],
['Liskov substitution','Subtypes should preserve behavioural expectations of their base type','A subtype accepts calls valid for the base contract','A subtype may freely strengthen every precondition']
],
OS:[
['Processes and threads','Threads share a process address space while processes have isolated address spaces','Two worker threads access the same heap','Each thread always owns a separate process address space'],
['FCFS scheduling','Runs ready work in arrival order without preemption in its basic form','A short job waits behind a long arriving job','FCFS always minimizes average waiting time'],
['SJF scheduling','Chooses the shortest estimated next CPU burst','A short ready job runs before a longer one','SJF cannot starve long jobs'],
['Round Robin','Cycles ready processes with a time quantum','A process is preempted when its quantum expires','A smaller quantum has no context-switch overhead'],
['Priority scheduling','Chooses work by priority and can use aging to reduce starvation','Raise priority gradually for a long-waiting job','Priority scheduling inherently prevents starvation'],
['Context switching','Saving and restoring execution state between scheduled tasks','The scheduler switches register state to another thread','Context switching always performs useful application computation'],
['Deadlock conditions','Mutual exclusion, hold-and-wait, no preemption and circular wait are jointly necessary','A lock acquisition cycle can trap waiting threads','Removing a necessary condition cannot prevent deadlock'],
['Mutex and semaphore','A mutex protects ownership-based exclusion; a semaphore counts permits','A semaphore limits simultaneous workers to three','A counting semaphore can only ever have value one'],
['Producer consumer','Coordinates bounded-buffer production and consumption','Use empty/full counts with exclusion around buffer updates','Only a mutex guarantees consumers never read an empty buffer'],
['Readers writers','Allows concurrent readers while synchronizing writes','Protect a cache with a reader-writer policy','All readers must always exclude one another'],
['Paging','Maps fixed-size virtual pages to physical frames','A page table maps virtual addresses','Paging requires every process to occupy contiguous physical memory'],
['Virtual memory','Provides virtual address spaces backed by memory and possibly storage','A page fault loads a nonresident page','A page fault always means an invalid address'],
['Thrashing and replacement','Excessive page faults can dominate execution when working sets do not fit','Reduce multiprogramming when paging activity overwhelms useful work','More active processes always reduce thrashing']
],
CN:[
['OSI layers','A seven-layer reference model separates networking responsibilities','Routing is associated with the network layer','Routing is exclusively a presentation-layer function'],
['TCP/IP','An Internet protocol suite spanning link, internet, transport and application functions','IP routes packets while TCP provides a reliable stream','TCP/IP and OSI require identical layer counts'],
['TCP vs UDP','TCP provides ordered reliable streams; UDP provides datagrams without that guarantee','Use UDP where low-latency application-managed delivery is preferred','UDP guarantees retransmission and ordered delivery'],
['HTTP and HTTPS','HTTPS carries HTTP over authenticated encrypted TLS connections','A browser verifies a server certificate during TLS','HTTPS proves every webpage statement is trustworthy'],
['DNS','Resolves names and other records using distributed DNS infrastructure','Resolve a hostname to an address before connecting','DNS assigns a device its network lease'],
['DHCP','Automatically supplies network configuration leases','A new laptop receives an IP address and gateway','DHCP is the same as resolving a hostname'],
['ARP','Resolves IPv4 neighbours to link-layer addresses on a local network','Find the MAC address for the local next hop','ARP directly resolves an arbitrary remote host across the Internet'],
['Subnetting','An address prefix identifies a network portion','A conventional IPv4 /24 subnet has 256 addresses','Every /24 has 256 usable host addresses in conventional allocation'],
['Routers and switches','Routers forward between networks while switches typically forward local Ethernet frames','A switch learns MAC-to-port mappings','An Ethernet hub learns destination MAC routes'],
['TCP handshake and ports','SYN, SYN-ACK, ACK establish a TCP connection; ports identify endpoints','HTTPS commonly uses TCP port 443','TCP establishes a connection using only one SYN packet']
]};
const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/-$/,'');
const limits={'AI Literacy':100,DBMS:40,SQL:40,OOP:25,OS:25,CN:20};
const lessons=[];
for(const [topic,facts] of Object.entries(banks)){
 const questions=[];
 facts.forEach(([name,explanation,example,trap],i)=>{
  const others=facts.filter((_,j)=>j!==i);
  questions.push({id:`${slug(topic)}-${String(i*2+1).padStart(3,'0')}`,topic,difficulty:i%3?'easy':'medium',question:`Which statement correctly describes ${name.toLowerCase()}?`,options:[explanation,trap,others[(i+1)%others.length][1],others[(i+3)%others.length][1]],correctAnswer:0,explanation:`${explanation}. Example: ${example}. Avoid this misconception: ${trap}.`,tags:[slug(name)]});
  questions.push({id:`${slug(topic)}-${String(i*2+2).padStart(3,'0')}`,topic,difficulty:'medium',question:`A candidate proposes this use case: “${example}.” Which concept best explains it?`,options:[name,...[0,2,4].map(n=>others[(i+n)%others.length][0])],correctAnswer:0,explanation:`${name}: ${explanation}. ${trap} is a misconception.`,tags:[slug(name)]});
 });
 write(`${slug(topic)}-mcqs`,questions.slice(0,limits[topic]));
 lessons.push({id:slug(topic),title:topic==='OS'?'Operating Systems':topic==='CN'?'Computer Networks':topic,summary:`Build assessment-ready understanding of ${topic}. Study the concept, trace the example, and explain the trap before practicing.`,concepts:facts.map(([name,explanation,example,trap])=>({name,explanation,example,trap})),interview:facts.slice(0,5).map(f=>`Explain ${f[0]} with a project example and discuss its limitations.`),cheatSheet:facts.map(f=>`${f[0]}: ${f[1]}`)});
}
for(const [title,names] of [['RAG',banks['AI Literacy'].slice(32)],['Generative AI',banks['AI Literacy'].slice(3,19)],['Prompt Engineering',banks['AI Literacy'].filter((_,i)=>[9,26,28,29,30,31,40,45,49].includes(i))],['Technical Fundamentals',[...banks.DBMS.slice(0,4),...banks.OOP.slice(0,4),...banks.OS.slice(0,3),...banks.CN.slice(0,3)]],['DSA',[
 ['Arrays','Indexed contiguous logical sequences provide O(1) access','Scan once to find a maximum','Repeated insertion at the start is constant time'],['Hashing','Maps provide expected O(1) lookup with collision handling','Store complements for a two-sum search','Hash maps guarantee O(1) worst-case lookup'],['Two pointers','Move two indices according to an invariant','Compare sorted values at opposite ends','Pointers may move without preserving the invariant'],['Sliding window','Maintain state over a moving contiguous range','Update a fixed-window sum by one addition and subtraction','Negative values never affect variable-window reasoning'],['Binary search','Halve a monotone search space','Find the first true predicate in a sorted domain','Binary search works on every unsorted input'],['Stacks and queues','Stacks are LIFO and queues are FIFO','Use a stack to match brackets','A queue removes the newest element first'],['Trees and graphs','Model hierarchical and arbitrary relationships','Use BFS for unweighted shortest paths','DFS always finds the shortest unweighted path'],['Complexity','Describe resource growth relative to input size','A single scan with a set takes expected O(n) time and O(n) space','O(n) time means exactly n milliseconds']
]]]) lessons.push({id:slug(title),title,summary:`Understand ${title} through mechanisms, examples, and assessment traps.`,concepts:names.map(([name,explanation,example,trap])=>({name,explanation,example,trap})),interview:names.slice(0,5).map(f=>`When would you use ${f[0]} and what trade-offs would you explain?`),cheatSheet:names.map(f=>`${f[0]}: ${f[1]}`)});
write('lessons',lessons);
write('interview-questions', ['Tell Me About Yourself','Resume','Projects','OOP','DBMS','SQL','OS','CN','DSA','AI/RAG','HR'].flatMap((topic,i)=>[
`Give a focused 90-second introduction connecting your background to a technology role.`,
`What evidence from your experience demonstrates your ${topic==='HR'?'teamwork':topic} skills?`,
`Describe a difficult decision in ${topic} and the alternatives you considered.`,
`Explain a ${topic} concept to a nontechnical teammate using an example.`,
`Describe a failure or misconception in ${topic} and what you learned.`,
`How would you validate correctness in a task involving ${topic}?`,
`What trade-off would you discuss when choosing a ${topic} approach?`,
`How would you improve the performance or clarity of your ${topic} work?`,
`What follow-up questions would you ask before beginning a ${topic} task?`,
`Describe how you would collaborate when requirements for ${topic} are ambiguous.`
].map((question,j)=>({id:`interview-${i}-${j}`,topic,question,guide:`Use a concrete example. Explain the context, your own contribution, alternatives, validation and outcome. For technical topics state assumptions and complexity; for behavioural topics use situation, task, action, result. Avoid claiming work you cannot explain.`}))));
const reasoning=[];
const addReason=(topic,question,options,correctAnswer,explanation)=>reasoning.push({id:`reasoning-${reasoning.length+1}`,topic,difficulty:'easy',question,options:options.map(String),correctAnswer,explanation,tags:[slug(topic)]});
for(let i=1;i<=8;i++){
 const a=i+2,d=i+3;
 addReason('Number series',`Find the next number: ${a}, ${a+d}, ${a+2*d}, ${a+3*d}, ?`,[a+4*d,a+5*d,a+4*d-1,a+3*d+1],0,`Each term increases by ${d}; next is ${a+4*d}.`);
 addReason('Pattern recognition',`A sequence begins ${i}, ${i*2}, ${i*4}, ${i*8}. What follows?`,[i*16,i*10,i*12,i*15],0,'Each value doubles.');
 addReason('Logical reasoning',`There are ${i+3} people in a queue. Arun is ${i+1} from the front. What is his position from the back?`,[3,2,4,i+1],0,`Position from back = ${i+3} - ${i+1} + 1 = 3.`);
 addReason('Syllogism',`All group-${i} trainees are employees. No employee is a visitor. Which must follow?`,['No group-'+i+' trainee is a visitor','All visitors are trainees','Some employees must be visitors','All employees are trainees'],0,'A trainee is an employee, and the employee set has no overlap with visitors.');
 const word=['CAT','DOG','MAP','SUN','PEN','BUS','HAT','BOX'][i-1],encoded=[...word].map(c=>String.fromCharCode(65+(c.charCodeAt(0)-65+i)%26)).join('');
 addReason('Coding-decoding',`Shift each uppercase letter forward by ${i} (wrap after Z). How is ${word} encoded?`,[encoded,word,[...word].reverse().join(''),encoded+'A'],0,`Apply a +${i} shift independently to each character: ${encoded}.`);
 addReason('Directions',`Walk ${i+2} km north, ${i+4} km east, then ${i+2} km south. Where are you relative to the start?`,[`${i+4} km east`,`${i+2} km north`,`${i+4} km west`,'At the start'],0,'North and south movements cancel; the eastward movement remains.');
 addReason('Blood relations',`In family ${i}, Mira is the sister of Ravi. Ravi is the father of Leena. How is Mira related to Leena?`,['Paternal aunt','Mother','Grandmother','Cousin'],0,'The sister of a father is a paternal aunt.');
 addReason('Data interpretation',`A team resolves ${i*10} tickets Monday and ${i*15} Tuesday. What percentage of the two-day total was resolved Tuesday?`,[60,50,40,75],0,`${i*15}/(${i*25}) × 100 = 60%.`);
 addReason('Quantitative aptitude',`An item costs ₹${i*200}. A 10% discount is applied. What is the selling price?`,[i*180,i*190,i*200,i*160],0,'Multiply the original price by 0.90.');
 addReason('Sequences',`What is the sum of the first ${i+3} positive integers?`,[(i+3)*(i+4)/2,(i+3)*(i+3),(i+3)*(i+4),(i+2)*(i+3)/2],0,`Use n(n+1)/2 with n=${i+3}.`);
}
write('reasoning-questions',reasoning);
write('communication',[
{id:'comm-grammar',topic:'Grammar',question:'Choose the correct sentence.',options:['Each of the candidates has submitted a résumé.','Each of the candidates have submitted a résumé.','Each candidates has submitted a résumé.','Each of candidates have submitted a résumé.'],correctAnswer:0,explanation:'Each is singular, so use has.',difficulty:'easy',tags:['agreement']},
{id:'comm-correction',topic:'Sentence correction',question:'Choose the clearest professional sentence.',options:['Please send the report by Friday.','Send me report fast.','You must sending report Friday.','Report should been send Friday.'],correctAnswer:0,explanation:'Use a polite imperative and a concrete deadline.',difficulty:'easy',tags:['clarity']},
{id:'comm-reading',topic:'Reading comprehension',question:'Memo: The release is postponed until QA completes regression testing. Customer support must prepare the change notice today. Which task must happen today?',options:['Prepare the change notice','Release the software','Skip regression tests','Cancel customer support'],correctAnswer:0,explanation:'The memo explicitly sets today as the deadline for preparing the notice.',difficulty:'easy',tags:['reading']},
{id:'comm-listening',topic:'Listening-style',question:'Listen to the briefing using the play button: The review is moved from Tuesday to Thursday at 3 PM. What is the new review time?',options:['Thursday, 3 PM','Tuesday, 3 PM','Thursday, 10 AM','Friday, 3 PM'],correctAnswer:0,explanation:'The briefing changes the review to Thursday at 3 PM.',difficulty:'easy',tags:['listening']}
]);
