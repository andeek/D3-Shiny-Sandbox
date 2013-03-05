reactivePlot <- function (outputId) 
{
  HTML(paste("<div id=\"", outputId, "\" class=\"shiny-graph-output\"><svg /></div>", sep=""))
}

shinyUI(pageWithSidebar(
  
  headerPanel("Interactive Scatter Plot"),
  
  sidebarPanel(
    uiOutput("choose_dataset"),
    
    uiOutput("choose_x"),
    
    uiOutput("choose_y")
  ),
  
  
  mainPanel(
    includeHTML("scripts/graph.js"),
    reactivePlot(outputId = "perfplot")
  )
))
