import ArticleLayout from "@/components/ArticleLayout";

const StorageGuide = () => (
  <ArticleLayout
    category="Storage & Handling"
    title="The Complete Peptide Storage Guide"
    readTime="5 min read"
    date="February 2026"
  >
    <p>Proper storage is absolutely critical for maintaining peptide integrity. Even the highest quality peptides will degrade if stored incorrectly, wasting your research investment.</p>

    <h2>Lyophilized (Powder) Storage</h2>
    <ul>
      <li><strong>Temperature:</strong> -20°C (freezer) for long-term storage</li>
      <li><strong>Alternative:</strong> 2-8°C (refrigerator) acceptable for up to 12 months</li>
      <li><strong>Shelf Life:</strong> 2-3 years when stored at -20°C</li>
    </ul>

    <h3>Freezer Storage Best Practices</h3>
    <ul>
      <li>Use a dedicated freezer, not one opened frequently</li>
      <li>Store in sealed container to prevent moisture exposure</li>
      <li>Keep away from freezer door (temperature fluctuates)</li>
      <li>Label clearly with peptide name and date received</li>
    </ul>

    <h2>Reconstituted Peptide Storage</h2>
    <ul>
      <li><strong>Temperature:</strong> 2-8°C (refrigerator) ALWAYS — never freeze</li>
      <li><strong>Duration:</strong> 28-30 days maximum</li>
      <li><strong>Location:</strong> Back of fridge, not in door</li>
    </ul>
    <p><strong>❌ Never Freeze Reconstituted Peptides.</strong> Once peptides are mixed with water, freezing will destroy their molecular structure. They must stay refrigerated (not frozen) at all times. This is the most common storage mistake!</p>

    <h2>Light Protection</h2>
    <p>Many peptides are light-sensitive and will degrade when exposed to light:</p>
    <ul>
      <li>Store in original amber/brown vials when possible</li>
      <li>Keep in dark area of refrigerator</li>
      <li>Minimise exposure to room light during handling</li>
      <li>Consider wrapping vials in aluminium foil for extra protection</li>
    </ul>

    <h2>Temperature Guidelines by State</h2>

    <h3>Lyophilized (Powder)</h3>
    <table>
      <thead><tr><th>Condition</th><th>Temperature</th></tr></thead>
      <tbody>
        <tr><td>Optimal</td><td>-20°C (standard freezer)</td></tr>
        <tr><td>Acceptable</td><td>2-8°C (refrigerator) for &lt;12 months</td></tr>
        <tr><td>Room temp</td><td>Only during shipping (48-72 hours max)</td></tr>
      </tbody>
    </table>

    <h3>Reconstituted (Liquid)</h3>
    <table>
      <thead><tr><th>Condition</th><th>Temperature</th></tr></thead>
      <tbody>
        <tr><td>Required</td><td>2-8°C (refrigerator)</td></tr>
        <tr><td>Never</td><td>Below 0°C (freezing) or above 8°C</td></tr>
      </tbody>
    </table>

    <h2>Common Storage Mistakes</h2>
    <ul>
      <li><strong>Refrigerator door storage</strong> — Temperature fluctuates too much</li>
      <li><strong>Freezing reconstituted peptides</strong> — Destroys peptide structure</li>
      <li><strong>Not labelling vials</strong> — Easy to confuse peptides or forget dates</li>
      <li><strong>Leaving at room temperature</strong> — Even brief periods accelerate degradation</li>
      <li><strong>Opening/closing vials frequently</strong> — Introduces moisture and contaminants</li>
    </ul>

    <h2>Shipping & Receiving</h2>
    <p>Most suppliers ship peptides at ambient (room) temperature with ice packs. This is acceptable for lyophilized peptides for 48-72 hours.</p>
    <p>Upon receipt:</p>
    <ol>
      <li>Inspect packaging for damage</li>
      <li>Check vials for cracks or leaks</li>
      <li>Store immediately in freezer or refrigerator</li>
      <li>Log batch numbers and expiration dates</li>
    </ol>

    <h2>Shelf Life Guidelines</h2>
    <h3>Lyophilized peptides</h3>
    <table>
      <thead><tr><th>Condition</th><th>Duration</th></tr></thead>
      <tbody>
        <tr><td>At -20°C</td><td>2-3 years</td></tr>
        <tr><td>At 2-8°C</td><td>12-18 months</td></tr>
        <tr><td>At room temp</td><td>Days to weeks (not recommended)</td></tr>
      </tbody>
    </table>

    <h3>Reconstituted peptides</h3>
    <table>
      <thead><tr><th>Condition</th><th>Duration</th></tr></thead>
      <tbody>
        <tr><td>In bacteriostatic water</td><td>28-30 days</td></tr>
        <tr><td>In sterile water</td><td>24-48 hours only</td></tr>
      </tbody>
    </table>

    <h2>Signs of Degradation</h2>
    <p>Discard peptides if you notice:</p>
    <ul>
      <li>Cloudiness in solution (should be clear)</li>
      <li>Visible particles or sediment</li>
      <li>Colour change from original state</li>
      <li>Unusual odour</li>
      <li>Past expiration or 30-day reconstitution date</li>
    </ul>

    <h2>Best Practices Summary</h2>
    <ol>
      <li>Store lyophilized peptides at -20°C in freezer</li>
      <li>Store reconstituted peptides at 2-8°C in refrigerator (never freeze)</li>
      <li>Protect from light using amber vials or foil wrap</li>
      <li>Label everything clearly with dates</li>
      <li>Use reconstituted peptides within 28-30 days</li>
      <li>Never leave peptides at room temperature</li>
      <li>Check for signs of degradation before each use</li>
      <li>Keep detailed storage logs</li>
    </ol>
  </ArticleLayout>
);

export default StorageGuide;
