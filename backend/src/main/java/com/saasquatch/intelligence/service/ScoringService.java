package com.saasquatch.intelligence.service;
import com.saasquatch.intelligence.dto.*;
import com.saasquatch.intelligence.entity.*;
import org.springframework.stereotype.Service;
import java.util.*;
@Service
public class ScoringService {
 private final CorporateRelationshipService relationships;
 public ScoringService(CorporateRelationshipService r){relationships=r;}
 public LeadIntelligenceResponse intelligence(Lead l,List<CorporateRelationship> rels){
  Company c=l.getCompany();
  int revenue=points(c.getEstimatedRevenueMillions(),20), growth=growth(c.getGrowthRate()), tech=tech(c.getTechnologyStack());
  int decision=l.isDecisionMaker()?15:seniority(l.getSeniority()), industry=industry(c.getIndustry()), corporate=rels.isEmpty()?0:6;
  int confidence=Math.round(Math.max(0,Math.min(100,l.getDataConfidence()))/10f);
  int total=Math.min(100,revenue+growth+tech+decision+industry+corporate+confidence);
  List<SignalResponse> signals=l.getSignals().stream().map(s->new SignalResponse(s.getType().name(),s.getWeight(),s.getDescription())).toList();
  String why=signals.stream().limit(2).map(SignalResponse::description).reduce((a,b)->a+"; "+b).orElse("Strong account fit and verified lead data indicate a timely opportunity.");
  String action=total>=85?"Contact "+l.getTitle()+" today with an account-specific proposition.":total>=70?"Research the account and send personalized outreach within 48 hours.":total>=55?"Add to nurture and monitor for a new buying trigger.":"Keep in nurture and re-score when new data arrives.";
  List<String> cr=rels.stream().map(r->r.getType()+" → "+r.getRelatedCompany().getName()+": "+r.getDescription()).toList();
  return new LeadIntelligenceResponse(l.getId(),c.getName(),l.getContactName(),l.getTitle(),total,why,action,l.getDataConfidence(),new ScoreBreakdown(revenue,growth,tech,decision,industry,corporate,confidence),signals,cr);
 }
 int points(Double v,int max){if(v==null)return 4;if(v>=100)return max;if(v>=50)return max-3;if(v>=20)return max-6;if(v>=10)return max-10;return max-14;}
 int growth(Double v){if(v==null)return 6;if(v>=35)return 18;if(v>=25)return 15;if(v>=15)return 12;if(v>=8)return 9;return 6;}
 int tech(String v){String s=v==null?"":v.toLowerCase();if(s.contains("spring boot")&&s.contains("aws")&&s.contains("kafka"))return 17;if(s.contains("java")&&s.contains("aws"))return 14;if(s.contains("python")&&s.contains("aws"))return 11;if(s.contains("aws")||s.contains("azure")||s.contains("cloud"))return 9;return 7;}
 int seniority(String v){String s=v==null?"":v.toLowerCase();if(s.contains("chief"))return 15;if(s.contains("vp"))return 13;if(s.contains("director"))return 11;if(s.contains("head"))return 9;return 6;}
 int industry(String v){if(v==null)return 8;return switch(v){case "Technology","FinTech","Cloud Infrastructure"->14;case "SaaS","Healthcare Technology","Retail Technology"->11;default->8;};}
}