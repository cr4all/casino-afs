from app.models import RiskResultMessage





def collect_signals(result: RiskResultMessage) -> list[str]:

    return [signal for engine in result.engines.values() for signal in engine.signals]





def map_decision_to_action(result: RiskResultMessage) -> str:

    signals = collect_signals(result)

    event_type = result.event_type

    decision = result.decision



    if decision == "allow":

        return "allow"



    if decision == "block":

        if event_type == "payment.withdraw":

            return "hold_withdrawal"

        if event_type == "player.login.failed":

            return "rate_limit_ip"

        if event_type == "player.signup.failed":

            return "rate_limit_signup"

        if event_type == "player.login":

            return "block_login"

        if event_type == "player.signup":

            return "reject_signup"

        if event_type == "payment.deposit":

            return "block_deposit"

        if event_type in {"wallet.bet", "game.bet"}:

            return "block_bet"

        if event_type == "wallet.win":

            return "hold_win_credit"

        return "block"



    # challenge

    if event_type == "player.login":

        return "require_mfa"

    if event_type == "payment.withdraw":

        return "manual_review_withdrawal"

    if event_type == "player.signup":

        return "step_up_verification"

    if "untrusted_device_login" in signals:

        return "require_mfa"

    return "flag_for_review"

