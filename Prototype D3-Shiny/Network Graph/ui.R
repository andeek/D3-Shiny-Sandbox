reactivePlot <- function (outputId) 
{
  HTML(paste("<div id=\"", outputId, "\" class=\"shiny-graph-output\"><svg /></div>", sep=""))
}

shinyUI(pageWithSidebar(
  
  headerPanel("Interactive Graph"),
  
  sidebarPanel(
    uiOutput("choose_dataset"),
    
    uiOutput("choose_layout")
  ),
  
  
  mainPanel(
    includeHTML("scripts/graph.js"),
    reactivePlot(outputId = "perfplot")
  )
))
