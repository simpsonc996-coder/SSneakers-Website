<?php
$contactEmail = 'support@ssneakers.com';
$contactPhone = '+27 12 345 6789';
$contactAddress = 'Cape Town, South Africa';
$currentYear = date('Y');
?>

<style>
  .ss-footer {
    --ssneakers-red: #ea2e0e;
    position: relative;
    width: 100%;
    background: linear-gradient(90deg, #0f0f0f 0%, #1a1a1a 60%, #0f0f0f 100%);
    color: #f3f4f6;
    padding: 14px 20px 16px;
    margin-top: 24px;
    box-sizing: border-box;
    font-family: 'Inter', 'Segoe UI', Tahoma, sans-serif;
    font-size: 14px;
    border-top: 2px solid var(--ssneakers-red);
    box-shadow: 0 -4px 14px rgba(0, 0, 0, 0.18);
  }

  .ss-footer-inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-wrap: wrap;
    gap: 10px 18px;
    align-items: center;
    justify-content: space-between;
  }

  .ss-footer-contact {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    align-items: center;
  }

  .ss-footer-label {
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #ffffff;
    margin-right: 4px;
  }

  .ss-footer-chip {
    background: rgba(234, 46, 14, 0.14);
    border: 1px solid rgba(234, 46, 14, 0.45);
    border-radius: 999px;
    padding: 4px 10px;
    line-height: 1.2;
  }

  .ss-footer a {
    color: #f9fafb;
    text-decoration: none;
    transition: color 0.2s ease, background-color 0.2s ease;
  }

  .ss-footer a:hover {
    color: #ffffff;
    background: rgba(234, 46, 14, 0.25);
  }

  .ss-footer-copy {
    color: #d1d5db;
    letter-spacing: 0.02em;
  }

  @media (max-width: 640px) {
    .ss-footer {
      padding: 12px 14px 14px;
      font-size: 13px;
    }

    .ss-footer-inner {
      gap: 8px;
    }

    .ss-footer-copy {
      width: 100%;
    }
  }
</style>

<footer class="ss-footer" role="contentinfo">
  <div class="ss-footer-inner">
    <div class="ss-footer-contact">
      <span class="ss-footer-label">Contact</span>
      <a class="ss-footer-chip" href="mailto:<?php echo htmlspecialchars($contactEmail); ?>"><?php echo htmlspecialchars($contactEmail); ?></a>
      <a class="ss-footer-chip" href="tel:<?php echo preg_replace('/\s+/', '', $contactPhone); ?>"><?php echo htmlspecialchars($contactPhone); ?></a>
      <span class="ss-footer-chip"><?php echo htmlspecialchars($contactAddress); ?></span>
    </div>
    <small class="ss-footer-copy">&copy; <?php echo $currentYear; ?> SSneakers. All rights reserved.</small>
  </div>
</footer>
